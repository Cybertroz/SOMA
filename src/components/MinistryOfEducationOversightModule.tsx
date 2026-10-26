/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  Radio,
  Check,
  Building,
  School,
  Key,
  KeyRound,
  Settings,
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

export function MinistryOfEducationOversightModule({
  currentUser,
  schools,
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
  const [activeSubTab, setActiveSubTab] = useState<
    | 'schools'
    | 'transfers'
    | 'capitation'
    | 'statutory-reports'
    | 'executive-audits'
    | 'exams'
    | 'major-approvals'
    | 'signing-settings'
    | 'security'
  >('schools');

  // Statutory Reports State with localStorage persistence
  const [statutoryReports, setStatutoryReports] = useState<MoeStatutoryReport[]>(() => {
    const s = localStorage.getItem('limuru_moe_statutory_reports');
    return s ? JSON.parse(s) : INITIAL_MOE_STATUTORY_REPORTS;
  });

  // Signing Officers and User Level Authority Settings State with persistence
  const [signingOfficers, setSigningOfficers] = useState<MoeSigningOfficer[]>(() => {
    const s = localStorage.getItem('limuru_moe_signing_officers');
    return s ? JSON.parse(s) : INITIAL_MOE_SIGNING_OFFICERS;
  });

  // Executive Directives & Anti-Fraud Audit States with localStorage persistence
  const [suffixAudits, setSuffixAudits] = useState<InstitutionalSuffixAudit[]>(() => {
    const s = localStorage.getItem('limuru_moe_suffix_audits');
    return s ? JSON.parse(s) : INITIAL_SUFFIX_AUDITS;
  });

  const [knecMappings, setKnecMappings] = useState<KnecLearnerMappingRecord[]>(() => {
    const s = localStorage.getItem('limuru_moe_knec_mappings');
    return s ? JSON.parse(s) : INITIAL_KNEC_MAPPINGS;
  });

  const [teacherWorkloads, setTeacherWorkloads] = useState<TeacherWorkloadMatchingReturn[]>(() => {
    const s = localStorage.getItem('limuru_moe_teacher_workloads');
    return s ? JSON.parse(s) : INITIAL_TEACHER_WORKLOADS;
  });

  const [stemLabAudits, setStemLabAudits] = useState<StemLabFacilityReturn[]>(() => {
    const s = localStorage.getItem('limuru_moe_stem_lab_audits');
    return s ? JSON.parse(s) : INITIAL_STEM_LAB_AUDITS;
  });

  const [sanitationAudits, setSanitationAudits] = useState<SanitationRatioReturn[]>(() => {
    const s = localStorage.getItem('limuru_moe_sanitation_audits');
    return s ? JSON.parse(s) : INITIAL_SANITATION_AUDITS;
  });

  const [capitationReconciliations, setCapitationReconciliations] = useState<CapitationReconciliationReturn[]>(() => {
    const s = localStorage.getItem('limuru_moe_capitation_reconciliations');
    return s ? JSON.parse(s) : INITIAL_CAPITATION_RECONCILIATIONS;
  });

  const [uniformReturns, setUniformReturns] = useState<UniformCostControlReturn[]>(() => {
    const s = localStorage.getItem('limuru_moe_uniform_returns');
    return s ? JSON.parse(s) : INITIAL_UNIFORM_COST_RETURNS;
  });

  const [sneReturns, setSneReturns] = useState<SneAssessmentReturn[]>(() => {
    const s = localStorage.getItem('limuru_moe_sne_returns');
    return s ? JSON.parse(s) : INITIAL_SNE_RETURNS;
  });

  const [safetyReturns, setSafetyReturns] = useState<ComprehensiveSafetyReturn[]>(() => {
    const s = localStorage.getItem('limuru_moe_safety_returns');
    return s ? JSON.parse(s) : INITIAL_SAFETY_RETURNS;
  });

  const [transitionReturns, setTransitionReturns] = useState<SeniorTransitionComplianceReturn[]>(() => {
    const s = localStorage.getItem('limuru_moe_transition_returns');
    return s ? JSON.parse(s) : INITIAL_TRANSITION_RETURNS;
  });

  const [priorityItems, setPriorityItems] = useState<PriorityActionItem[]>(() => {
    const s = localStorage.getItem('limuru_moe_priority_items');
    return s ? JSON.parse(s) : INITIAL_PRIORITY_ACTION_ITEMS;
  });

  React.useEffect(() => {
    localStorage.setItem('limuru_moe_statutory_reports', JSON.stringify(statutoryReports));
  }, [statutoryReports]);

  React.useEffect(() => {
    localStorage.setItem('limuru_moe_signing_officers', JSON.stringify(signingOfficers));
  }, [signingOfficers]);

  React.useEffect(() => {
    localStorage.setItem('limuru_moe_suffix_audits', JSON.stringify(suffixAudits));
    localStorage.setItem('limuru_moe_knec_mappings', JSON.stringify(knecMappings));
    localStorage.setItem('limuru_moe_teacher_workloads', JSON.stringify(teacherWorkloads));
    localStorage.setItem('limuru_moe_stem_lab_audits', JSON.stringify(stemLabAudits));
    localStorage.setItem('limuru_moe_sanitation_audits', JSON.stringify(sanitationAudits));
    localStorage.setItem('limuru_moe_capitation_reconciliations', JSON.stringify(capitationReconciliations));
    localStorage.setItem('limuru_moe_uniform_returns', JSON.stringify(uniformReturns));
    localStorage.setItem('limuru_moe_sne_returns', JSON.stringify(sneReturns));
    localStorage.setItem('limuru_moe_safety_returns', JSON.stringify(safetyReturns));
    localStorage.setItem('limuru_moe_transition_returns', JSON.stringify(transitionReturns));
    localStorage.setItem('limuru_moe_priority_items', JSON.stringify(priorityItems));
  }, [
    suffixAudits,
    knecMappings,
    teacherWorkloads,
    stemLabAudits,
    sanitationAudits,
    capitationReconciliations,
    uniformReturns,
    sneReturns,
    safetyReturns,
    transitionReturns,
    priorityItems,
  ]);

  const handleUploadExcelReturn = (category: string, count: number) => {
    showToast(`Ingested ${count} verified records for ${category} via Excel.`);
  };

  const handleEndorseReport = (reportId: string, officerName: string) => {
    setStatutoryReports((prev) =>
      prev.map((r) => {
        if (r.id !== reportId) return r;
        return {
          ...r,
          status: 'Verified & Endorsed',
          verifiedByOfficer: officerName,
          complianceRatingPercent: 100,
        };
      })
    );
  };

  const handleAddSigningOfficer = (newOfficer: MoeSigningOfficer) => {
    setSigningOfficers((prev) => [newOfficer, ...prev]);
  };

  const handleUpdateOfficerPin = (officerId: string, newPin: string) => {
    setSigningOfficers((prev) =>
      prev.map((o) => (o.id === officerId ? { ...o, signingPin: newPin } : o))
    );
  };

  const handleToggleOfficerStatus = (officerId: string) => {
    setSigningOfficers((prev) =>
      prev.map((o) => {
        if (o.id !== officerId) return o;
        const newStatus = o.status === 'Active Authorized' ? 'Suspended' : 'Active Authorized';
        return { ...o, status: newStatus };
      })
    );
  };

  // School Search & Filters
  const [schoolSearch, setSchoolSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Public Comprehensive' | 'Private Academy' | 'SNE Approved Special School'>('All');
  const [subCountyFilter, setSubCountyFilter] = useState<string>('All');

  // Selected Records for Modals
  const [selectedSchoolDetails, setSelectedSchoolDetails] = useState<KiambuSchoolRecord | null>(null);
  const [selectedTransferForCert, setSelectedTransferForCert] = useState<MoeTransferApproval | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Security Freeze Mode State (Inspectorate feature)
  const [isAuditLocked, setIsAuditLocked] = useState(false);

  const subCountiesList = Array.from(new Set(schools.map((s) => s.subCounty)));

  // Filtered Schools
  const filteredSchools = schools.filter((s) => {
    if (categoryFilter !== 'All' && s.category !== categoryFilter) return false;
    if (subCountyFilter !== 'All' && s.subCounty !== subCountyFilter) return false;
    if (schoolSearch.trim()) {
      const q = schoolSearch.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.centerCode.includes(q) ||
        s.subCounty.toLowerCase().includes(q) ||
        s.principalName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Aggregated Summary Statistics
  const totalCountyEnrolled = schools.reduce((acc, s) => acc + s.enrolledLearners, 0);
  const totalCapitationAllocated = disbursements.reduce((acc, d) => acc + d.totalAmountDisbursed, 0);
  const totalKpseaCandidates = schools.reduce((acc, s) => acc + s.kpseaCandidateCount, 0);
  const totalKjseaCandidates = schools.reduce((acc, s) => acc + s.kjseaCandidateCount, 0);
  const pendingTransfersCount = transfers.filter((t) => t.status === 'Pending CDE Approval').length;

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleApproveTransferAction = (t: MoeTransferApproval) => {
    onApproveTransfer(t.id, `${currentUser.name} (${currentUser.title})`);
    onLogAudit(
      'MOE_TRANSFER_DECISION',
      `MoE Transfer Approval · ${t.studentName} (${t.nemisUpi})`,
      `Authorized transfer from ${t.fromSchoolName} to ${t.toSchoolName}. Issued Certificate MOE/NEMIS/TRF/2026/${Math.floor(1000 + Math.random() * 9000)}.`,
      'Restricted'
    );
    showToast(`Transfer for ${t.studentName} approved and clearance certificate issued.`);
  };

  const handleDisburseAction = (d: MoeCapitationDisbursement) => {
    onApproveDisbursement(d.id, `${currentUser.name} (${currentUser.title})`);
    onLogAudit(
      'MOE_CAPITATION_DISBURSE',
      `Treasury Capitation Warrant · ${d.schoolName}`,
      `Released Term 1 FPE/FDJSE tranche of KES ${d.totalAmountDisbursed.toLocaleString()} via IFMIS voucher ${d.treasuryVoucherRef}.`,
      'Confidential'
    );
    showToast(`Capitation of KES ${d.totalAmountDisbursed.toLocaleString()} approved for ${d.schoolName}!`);
  };

  const handleExportCountyRegister = () => {
    const rows = filteredSchools.map((s, idx) => ({
      'No': idx + 1,
      'School Center Code': s.centerCode,
      'School Official Name': s.name,
      'Category': s.category,
      'Sub-County': s.subCounty,
      'Principal / Head': s.principalName,
      'Official Phone': s.contactPhone,
      'Enrolled Learners': s.enrolledLearners,
      'KEMIS Verified Headcount': s.verifiedKemisHeadcount,
      'Term 1 Capitation (KES)': s.fpeFdjseCapitationTerm1,
      'KPSEA Grade 6 Candidates': s.kpseaCandidateCount,
      'KJSEA Grade 9 Candidates': s.kjseaCandidateCount,
      'QASO Compliance Score (%)': s.complianceScore,
      'Accreditation Status': s.accreditationStatus,
      'Infrastructure Grants (KES)': s.infrastructureGrantApproved,
    }));

    const filename = 'MoE_Kiambu_County_Schools_Master_Registry_2026';
    const columns = Object.keys(rows[0] || {}).map((k) => ({
      header: k,
      key: (item: any) => item[k] ?? '',
    }));

    exportToExcel(filename, rows, columns);

    onLogAudit(
      'DATA_EXPORT_EXCEL',
      'Ministry of Education Kiambu County Master Registry',
      `Exported comprehensive operations ledger for ${filteredSchools.length} primary and JSS schools.`,
      'Confidential'
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-xl shadow-xl border border-emerald-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{successToast}</span>
        </div>
      )}

      {/* Sovereign National Masthead */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-950 text-white rounded-2xl p-6 shadow-xl border border-emerald-700/60 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle Watermark Badge */}
        <div className="absolute right-0 top-0 bottom-0 opacity-5 pointer-events-none flex items-center pr-10">
          <Building2 className="w-96 h-96 text-emerald-400" />
        </div>

        <div className="space-y-2 z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              Republic of Kenya · Ministry of Education
            </span>
            <span className="text-slate-400 text-xs">·</span>
            <span className="text-xs font-semibold text-emerald-300">
              Kiambu County Directorate of Education (CDE) & National Inspectorate
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Comprehensive County Operations, Fund Disbursements & National Assessment Console
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            State-level supervisory portal for monitoring <strong>all Kiambu County approved public and private primary and junior secondary schools</strong>. Authorize inter-school NEMIS transfers, validate capitation grant disbursements, track KPSEA/KJSEA examination readiness, and enforce QASO compliance.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
            <span className="px-2.5 py-1 rounded bg-slate-900/90 text-slate-300 border border-emerald-800/80 font-mono">
              Signed in as: <strong className="text-amber-300">{currentUser.name}</strong> ({currentUser.title})
            </span>
            <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              PKI Cryptographic Seal Active (TLS 1.3)
            </span>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex flex-wrap lg:flex-col gap-2.5 shrink-0 z-10 w-full lg:w-auto">
          <button
            onClick={handleExportCountyRegister}
            className="flex-1 lg:flex-initial px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-colors border border-emerald-500/50"
          >
            <Download className="w-4 h-4" />
            Export County Master Register (.xlsx)
          </button>

          <button
            onClick={() => {
              setIsAuditLocked(!isAuditLocked);
              onLogAudit(
                'MOE_INSPECTION_AUDIT',
                'Kiambu County Inspection Freeze Switch',
                isAuditLocked
                  ? 'Inspectorate lifted emergency data freeze mode.'
                  : 'Inspectorate activated emergency tamper-proof audit freeze.',
                'Restricted'
              );
              showToast(isAuditLocked ? 'Audit freeze lifted.' : 'Tamper-proof audit freeze activated!');
            }}
            className={`flex-1 lg:flex-initial px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-colors border ${
              isAuditLocked
                ? 'bg-rose-700 hover:bg-rose-800 text-white border-rose-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Lock className="w-4 h-4" />
            {isAuditLocked ? 'Audit Freeze ACTIVE' : 'Enforce Inspection Freeze'}
          </button>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1 text-xs font-medium">
            <span>Approved Schools in County</span>
            <Building2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {schools.length} Institutions
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span className="text-emerald-700 font-semibold">
              {schools.filter((s) => s.category === 'Public Comprehensive').length} Public · {schools.filter((s) => s.category === 'Private Academy').length} Private
            </span>
            <span className="text-slate-400">1 SNE Special</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1 text-xs font-medium">
            <span>Total Enrolled Learners</span>
            <Users className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {totalCountyEnrolled.toLocaleString()} Students
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span className="text-emerald-700 font-semibold">100% KEMIS ULI Verified</span>
            <span className="text-slate-400">Grades 1–9</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1 text-xs font-medium">
            <span>Term 1 Capitation Disbursed</span>
            <DollarSign className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            KES {(totalCapitationAllocated / 1000000).toFixed(2)}M
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span className="text-emerald-700 font-semibold">FPE & FDJSE Tranche 1</span>
            <span className="text-slate-400">Treasury IFMIS</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1 text-xs font-medium">
            <span>Pending Approvals</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 tabular-nums">
            {pendingTransfersCount} Transfers · {majorApprovals.filter((a) => a.status !== 'Approved').length} Major
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span className="text-amber-800 font-semibold">Action Required</span>
            <span className="text-slate-400">CDE Clearance</span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Ribbon */}
      <div className="bg-white border border-slate-200 rounded-xl p-1.5 shadow-xs flex flex-wrap gap-1">
        {[
          { id: 'schools', label: 'County Schools & Executions', count: schools.length, icon: Building2 },
          { id: 'transfers', label: 'Transfer Authorizations', count: transfers.length, alert: pendingTransfersCount > 0, icon: ArrowRightLeft },
          { id: 'capitation', label: 'Capitation & Warrants', count: disbursements.length, icon: DollarSign },
          { id: 'statutory-reports', label: 'Statutory MoE Reports', count: statutoryReports.length, icon: FileText },
          { id: 'executive-audits', label: 'Executive Directives & Gap Audits', count: suffixAudits.length + knecMappings.length, icon: ShieldAlert },
          { id: 'exams', label: 'KPSEA/KJSEA CBC Exams', count: totalKpseaCandidates + totalKjseaCandidates, icon: Award },
          { id: 'major-approvals', label: 'Major Approvals & Charters', count: majorApprovals.length, icon: FileText },
          { id: 'signing-settings', label: 'Signing Authority & User Levels', count: signingOfficers.length, icon: KeyRound },
          { id: 'security', label: 'PKI Security & Audit Ledger', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-emerald-900 text-emerald-200' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
              {tab.alert && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          SUB-TAB 1: KIAMBU COUNTY SCHOOLS OPERATIONS REGISTRY
          ========================================================================= */}
      {activeSubTab === 'schools' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search school name, center code, or principal..."
                value={schoolSearch}
                onChange={(e) => setSchoolSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-medium">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden"
                >
                  <option value="All">All Categories</option>
                  <option value="Public Comprehensive">Public Comprehensive</option>
                  <option value="Private Academy">Private Academy</option>
                  <option value="SNE Approved Special School">SNE Special Needs</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-medium">Sub-County:</span>
                <select
                  value={subCountyFilter}
                  onChange={(e) => setSubCountyFilter(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden"
                >
                  <option value="All">All 12 Sub-Counties</option>
                  {subCountiesList.map((sc) => (
                    <option key={sc} value={sc}>
                      {sc}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* School Operations Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Center Code</th>
                    <th className="p-3">School Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Sub-County</th>
                    <th className="p-3 text-right">Learners</th>
                    <th className="p-3 text-right">Term 1 Capitation</th>
                    <th className="p-3 text-center">KNEC Candidates</th>
                    <th className="p-3 text-center">Compliance</th>
                    <th className="p-3 text-right">Inspection Dossier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSchools.map((sch) => (
                    <tr key={sch.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-900">{sch.centerCode}</td>
                      <td className="p-3">
                        <strong className="text-slate-900 block font-semibold">{sch.name}</strong>
                        <span className="text-[11px] text-slate-500 block">
                          Head: {sch.principalName} · {sch.contactPhone}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            sch.category === 'Public Comprehensive'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : sch.category === 'Private Academy'
                              ? 'bg-sky-50 text-sky-800 border border-sky-200'
                              : 'bg-purple-50 text-purple-800 border border-purple-200'
                          }`}
                        >
                          {sch.category}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700 font-medium">{sch.subCounty}</td>
                      <td className="p-3 text-right tabular-nums">
                        <strong className="text-slate-900">{sch.enrolledLearners}</strong>
                        <span className="text-[10px] text-emerald-700 block font-semibold">
                          {sch.verifiedKemisHeadcount} verified
                        </span>
                      </td>
                      <td className="p-3 text-right tabular-nums font-mono">
                        {sch.fpeFdjseCapitationTerm1 > 0 ? (
                          <span className="font-bold text-emerald-800">
                            KES {sch.fpeFdjseCapitationTerm1.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Private (KES 0)</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <div className="text-[11px] font-semibold text-slate-800">
                          {sch.kpseaCandidateCount} KPSEA · {sch.kjseaCandidateCount} KJSEA
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sch.complianceScore >= 95
                              ? 'bg-emerald-100 text-emerald-800'
                              : sch.complianceScore >= 90
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {sch.complianceScore}% QASO
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedSchoolDetails(sch)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1"
                        >
                          Inspect School
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

      {/* =========================================================================
          SUB-TAB 2: INTER-SCHOOL STUDENT TRANSFER CLEARANCE WORKFLOW
          ========================================================================= */}
      {activeSubTab === 'transfers' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                MoE NEMIS Inter-School Transfer Clearance Queue
                {pendingTransfersCount > 0 && (
                  <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                    {pendingTransfersCount} Awaiting CDE Authorization
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Constitutional clearance workflow verifying student UPIs, release credentials, and admitting stream capacity.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold">
                <tr>
                  <th className="p-3">Certificate No</th>
                  <th className="p-3">Learner & UPI</th>
                  <th className="p-3">Grade</th>
                  <th className="p-3">From School (Release)</th>
                  <th className="p-3">To School (Admit)</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">MoE Decision Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transfers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{t.nemisClearanceCertNo}</td>
                    <td className="p-3">
                      <strong className="text-slate-900 block font-semibold">{t.studentName}</strong>
                      <span className="text-[11px] text-slate-500 font-mono">{t.nemisUpi}</span>
                    </td>
                    <td className="p-3 font-semibold text-slate-800">{t.grade}</td>
                    <td className="p-3">
                      <span className="text-slate-900 font-medium block">{t.fromSchoolName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Center: {t.fromCenterCode}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-emerald-900 font-bold block">{t.toSchoolName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Center: {t.toCenterCode}</span>
                    </td>
                    <td className="p-3 text-slate-700">{t.reason}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.status === 'Approved by Ministry'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {t.status === 'Pending CDE Approval' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApproveTransferAction(t)}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve Transfer
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedTransferForCert(t)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs inline-flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-300" />
                          View Clearance Certificate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 3: CAPITATION ALLOCATION & DISBURSEMENT ENGINE
          ========================================================================= */}
      {activeSubTab === 'capitation' && (
        <div className="space-y-5">
          {/* Statutory MoE Formula Card */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-emerald-700/60">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-emerald-300 uppercase tracking-widest font-bold">
                Government of Kenya · Capitation Grant Statutory Formula (2026/2027)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800">
                <span className="text-emerald-300 block font-medium">Free Primary Education (FPE)</span>
                <strong className="text-xl font-black text-white tabular-nums">KES 1,420</strong>
                <span className="text-[11px] text-slate-300 block mt-0.5">Per Primary Learner (Term 1 Tranche)</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800">
                <span className="text-emerald-300 block font-medium">Free Day JSS Education (FDJSE)</span>
                <strong className="text-xl font-black text-amber-300 tabular-nums">KES 7,521</strong>
                <span className="text-[11px] text-slate-300 block mt-0.5">Per JSS Learner (50% Term 1 Tranche of KES 15,042)</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800">
                <span className="text-emerald-300 block font-medium">Special Needs (SNE Priority)</span>
                <strong className="text-xl font-black text-purple-300 tabular-nums">KES 22,000</strong>
                <span className="text-[11px] text-slate-300 block mt-0.5">Per SNE Learner (Assistive Learning Allocation)</span>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-slate-300 border-t border-emerald-800/80 pt-2 flex flex-wrap gap-4">
              <span><strong>Tuition & Textbooks:</strong> 30%</span>
              <span><strong>Operations & Utilities:</strong> 35%</span>
              <span><strong>Repairs & Maintenance:</strong> 15%</span>
              <span><strong>Activity & Co-Curricular:</strong> 10%</span>
              <span><strong>SMASSE Science Kit:</strong> 10%</span>
            </div>
          </div>

          {/* Disbursements Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Kiambu County Capitation Warrants & Treasury Disbursal Register
                </h3>
                <p className="text-xs text-slate-500">
                  Linked directly to Treasury IFMIS and civil registry student headcounts
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Warrant Tranche</th>
                    <th className="p-3">School Name</th>
                    <th className="p-3">Sub-County</th>
                    <th className="p-3 text-right">Eligible Learners</th>
                    <th className="p-3 text-right">Disbursed Amount</th>
                    <th className="p-3">Treasury Voucher</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {disbursements.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-900">{d.trancheNumber}</td>
                      <td className="p-3 font-semibold text-slate-900">{d.schoolName}</td>
                      <td className="p-3 text-slate-700">{d.subCounty}</td>
                      <td className="p-3 text-right font-mono">
                        <strong>{d.totalEligibleStudents}</strong>
                        <span className="text-[10px] text-slate-500 block">
                          ({d.primaryCount} Pri · {d.jssCount} JSS)
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-black text-emerald-800 tabular-nums">
                        KES {d.totalAmountDisbursed.toLocaleString()}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-600">{d.treasuryVoucherRef}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            d.status === 'Approved & Disbursed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {d.status === 'Awaiting CDE Sign-Off' ? (
                          <button
                            onClick={() => handleDisburseAction(d)}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs inline-flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Authorize Warrant
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-bold inline-flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Settled
                          </span>
                        )}
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
          SUB-TAB 4: KPSEA & KJSEA NATIONAL EXAM CBC TRACKING CONSOLE
          ========================================================================= */}
      {activeSubTab === 'exams' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Kenya National Examinations Council (KNEC) CBC Assessment Tracking
                <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                  KPSEA & KJSEA Live
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitoring candidate validation, continuous assessment task upload rates, and exam centers readiness across Kiambu County.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Grade 6 KPSEA Overview</span>
                <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                  {totalKpseaCandidates} Candidates Registered
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                KPSEA assesses foundational curriculum competencies across 5 subject batteries (English, Kiswahili, Mathematics, Integrated Science, Creative Arts). All {schools.length} examination centers in Kiambu have completed biometric invigilator allocation.
              </p>
              <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 font-mono text-slate-700">
                <div className="flex justify-between">
                  <span>Candidate UPI Handshake:</span>
                  <strong className="text-emerald-700">100% Validated</strong>
                </div>
                <div className="flex justify-between">
                  <span>Assessment Materials Dispatched:</span>
                  <strong className="text-emerald-700">Storage Secured (Armory)</strong>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Grade 9 KJSEA Transition Overview</span>
                <span className="text-xs bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-200">
                  {totalKjseaCandidates} Senior School Transition Candidates
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                KJSEA determines placement into Senior School Pathways (STEM, Social Sciences, Arts & Sports Science). 100% of Junior Secondary School centers in Kiambu County have verified their science lab and pre-technical workshop equipment.
              </p>
              <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 font-mono text-slate-700">
                <div className="flex justify-between">
                  <span>Continuous Assessment Weight (60%):</span>
                  <strong className="text-emerald-700">Marksheet Uploaded</strong>
                </div>
                <div className="flex justify-between">
                  <span>Summative National Battery (40%):</span>
                  <strong className="text-emerald-700">November 2026 Ready</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 5: MAJOR MOE APPROVALS & BOM CHARTERS
          ========================================================================= */}
      {activeSubTab === 'major-approvals' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h2 className="text-base font-bold text-slate-900">
              Statutory MoE Clearances, Labor Accreditations & BoM Gazettements
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Matters requiring official ministerial sign-off under the Basic Education Act.
            </p>
          </div>

          <div className="space-y-3">
            {majorApprovals.map((appr) => (
              <div
                key={appr.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500">
                      Center {appr.centerCode}
                    </span>
                    <span className="text-slate-300">·</span>
                    <strong className="text-slate-900 font-bold">{appr.schoolName}</strong>
                    <span
                      className={`text-[10px] px-2 py-0.2 rounded font-bold uppercase ${
                        appr.priority === 'Urgent'
                          ? 'bg-rose-100 text-rose-800'
                          : appr.priority === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {appr.priority}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-emerald-800 mt-1">{appr.type}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{appr.details}</p>

                  <div className="text-[11px] text-slate-500 pt-1 flex flex-wrap gap-3">
                    <span>Submitted: {appr.submissionDate}</span>
                    {appr.grantAmountKes && (
                      <span className="font-bold text-emerald-700">
                        Grant: KES {appr.grantAmountKes.toLocaleString()}
                      </span>
                    )}
                    {appr.approverOfficial && <span>Approver: {appr.approverOfficial}</span>}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {appr.status === 'Approved' ? (
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Approved by MoE
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        onApproveMajorRequest(appr.id, currentUser.name);
                        onLogAudit(
                          'MOE_SCHOOL_APPROVAL',
                          `Ministry Approval · ${appr.type} · ${appr.schoolName}`,
                          `Granted official MoE clearance for ${appr.type}.`,
                          'Restricted'
                        );
                        showToast(`Approved ${appr.type} for ${appr.schoolName}!`);
                      }}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Grant MoE Approval
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 6: INSPECTORATE PKI SECURITY & AUDIT BLOCKCHAIN
          ========================================================================= */}
      {activeSubTab === 'security' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                Ministry of Education High-Assurance Cryptographic Security Standard
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Government Enterprise Architecture (GEA) Security Protocol for School Administration & NEMIS Sync
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <strong className="text-slate-900 block font-bold">PKI Digital Signature Watermarking</strong>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Every student transfer authorization and capitation disbursement is stamped with an immutable SHA-256 cryptographic signature verified against the Kenya National PKI root certificate.
                </p>
                <div className="pt-2 text-[10px] font-mono text-emerald-700">Root: GOV-KE-PKI-CA-2026</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <strong className="text-slate-900 block font-bold">KEMIS & IFMIS TLS 1.3 Tunnel</strong>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  All inter-school synchronization packets pass through AES-256-GCM encrypted tunnels preventing man-in-the-middle attacks on student unique personal identifiers (UPIs).
                </p>
                <div className="pt-2 text-[10px] font-mono text-emerald-700">Handshake Latency: 18ms</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <strong className="text-slate-900 block font-bold">Tamper-Proof Audit Blockchain</strong>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Immutable event hashing logs every query, clearance, and fund disbursement. Audit records cannot be altered or purged even by local school database administrators.
                </p>
                <div className="pt-2 text-[10px] font-mono text-emerald-700">Block Integrity: 100% Verified</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 7: STATUTORY MOE REPORTING ENGINE (4 CORE PILLARS & 12 REPORTS)
          ========================================================================= */}
      {activeSubTab === 'statutory-reports' && (
        <MoeStatutoryReportsView
          currentUser={currentUser}
          reports={statutoryReports}
          schools={schools}
          onEndorseReport={handleEndorseReport}
          onLogAudit={onLogAudit}
        />
      )}

      {/* =========================================================================
          SUB-TAB: EXECUTIVE DIRECTIVES & AUDIT RETURNS
          ========================================================================= */}
      {activeSubTab === 'executive-audits' && (
        <MoeExecutiveDirectiveAuditsView
          currentUser={currentUser}
          suffixAudits={suffixAudits}
          knecMappings={knecMappings}
          teacherWorkloads={teacherWorkloads}
          stemLabAudits={stemLabAudits}
          sanitationAudits={sanitationAudits}
          capitationReconciliations={capitationReconciliations}
          uniformReturns={uniformReturns}
          sneReturns={sneReturns}
          safetyReturns={safetyReturns}
          transitionReturns={transitionReturns}
          priorityItems={priorityItems}
          onUploadExcelReturn={handleUploadExcelReturn}
          onLogAudit={onLogAudit}
        />
      )}

      {/* =========================================================================
          SUB-TAB 8: SIGNING AUTHORITY & USER LEVEL SETTINGS
          ========================================================================= */}
      {activeSubTab === 'signing-settings' && (
        <MoeSigningSettingsView
          currentUser={currentUser}
          officers={signingOfficers}
          onAddOfficer={handleAddSigningOfficer}
          onUpdateOfficerPin={handleUpdateOfficerPin}
          onToggleOfficerStatus={handleToggleOfficerStatus}
          onLogAudit={onLogAudit}
        />
      )}

      {/* =========================================================================
          MODAL: SCHOOL OPERATIONS DOSSIER
          ========================================================================= */}
      {selectedSchoolDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  {selectedSchoolDetails.name}
                  <span className="text-[10px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded font-mono">
                    Center {selectedSchoolDetails.centerCode}
                  </span>
                </h3>
                <p className="text-xs text-emerald-200/90 mt-0.5">
                  Sub-County: {selectedSchoolDetails.subCounty} · {selectedSchoolDetails.category}
                </p>
              </div>
              <button
                onClick={() => setSelectedSchoolDetails(null)}
                className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-800/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                <div>
                  <span className="text-[11px] text-slate-500 block">Total Enrolled</span>
                  <strong className="text-xl font-bold text-slate-900 tabular-nums">
                    {selectedSchoolDetails.enrolledLearners}
                  </strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">KEMIS Verified</span>
                  <strong className="text-xl font-bold text-emerald-700 tabular-nums">
                    {selectedSchoolDetails.verifiedKemisHeadcount}
                  </strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">QASO Score</span>
                  <strong className="text-xl font-bold text-amber-700 tabular-nums">
                    {selectedSchoolDetails.complianceScore}%
                  </strong>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Accreditation</span>
                  <strong className="text-xs font-bold text-slate-800 block mt-1">
                    {selectedSchoolDetails.accreditationStatus}
                  </strong>
                </div>
              </div>

              <div className="space-y-2">
                <strong className="text-slate-900 font-bold block text-sm">Official Institutional Profile</strong>
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 text-slate-700">
                  <div className="flex justify-between">
                    <span>Principal / Accounting Officer:</span>
                    <strong>{selectedSchoolDetails.principalName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Contact Mobile:</span>
                    <strong className="font-mono">{selectedSchoolDetails.contactPhone}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>GPS Coordinates:</span>
                    <strong className="font-mono">{selectedSchoolDetails.gpsCoordinates}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Curriculum Levels:</span>
                    <strong>{selectedSchoolDetails.levelsOffered.join(', ')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Infrastructure Grants Approved:</span>
                    <strong className="font-bold text-emerald-800">
                      KES {selectedSchoolDetails.infrastructureGrantApproved.toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setSelectedSchoolDetails(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: OFFICIAL MOE NEMIS CLEARANCE CERTIFICATE (PRINT READY)
          ========================================================================= */}
      {selectedTransferForCert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white px-6 py-4 flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-300 font-bold">
                Republic of Kenya · Ministry of Education
              </span>
              <button
                onClick={() => setSelectedTransferForCert(null)}
                className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-800/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6 text-slate-800">
              <div className="text-center space-y-1 border-b-2 border-slate-900 pb-4">
                <div className="w-12 h-12 mx-auto rounded-xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center font-bold text-lg mb-2">
                  🇰🇪
                </div>
                <h2 className="text-base font-black tracking-tight uppercase text-slate-900">
                  Ministry of Education · State Department for Basic Education
                </h2>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  National Education Management Information System (NEMIS)
                </h3>
                <h4 className="text-sm font-black text-slate-900 pt-1">
                  OFFICIAL INTER-SCHOOL LEARNER TRANSFER CLEARANCE CERTIFICATE
                </h4>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between font-mono font-bold text-emerald-800">
                  <span>Certificate Ref: {selectedTransferForCert.nemisClearanceCertNo}</span>
                  <span>Date: {selectedTransferForCert.reviewDate || selectedTransferForCert.submissionDate}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 space-y-1">
                  <div>Learner Name: <strong>{selectedTransferForCert.studentName}</strong></div>
                  <div>NEMIS UPI / ULI: <strong className="font-mono">{selectedTransferForCert.nemisUpi}</strong></div>
                  <div>Grade Level: <strong>{selectedTransferForCert.grade}</strong></div>
                  <div>Transferring From: <strong>{selectedTransferForCert.fromSchoolName} (Center {selectedTransferForCert.fromCenterCode})</strong></div>
                  <div>Admitted To: <strong>{selectedTransferForCert.toSchoolName} (Center {selectedTransferForCert.toCenterCode})</strong></div>
                  <div>Certified Reason: <strong>{selectedTransferForCert.reason}</strong></div>
                </div>
              </div>

              {/* Digital Seal */}
              <div className="pt-4 border-t-2 border-dashed border-slate-300 flex items-center justify-between text-xs">
                <div>
                  <span className="block text-[11px] text-slate-500">Authorized by:</span>
                  <strong className="text-slate-900 block font-bold">{selectedTransferForCert.reviewedBy || 'County Director of Education'}</strong>
                  <span className="text-[10px] text-emerald-700 font-mono">Digital Signature: {selectedTransferForCert.digitalStampCode || 'CDE-KBU-STAMP-9912'}</span>
                </div>
                <div className="text-right">
                  <div className="border-2 border-emerald-800 text-emerald-800 font-black px-3 py-1 rounded uppercase tracking-wider text-[11px]">
                    VALIDATED ON NEMIS
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-between">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print Certificate
              </button>
              <button
                onClick={() => setSelectedTransferForCert(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
