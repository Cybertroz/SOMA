/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Upload,
  DollarSign,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Printer,
  X,
  Edit,
  ExternalLink,
  ShieldCheck,
  Building2,
  Layers,
  Sparkles,
  Award,
  Users,
  Check,
  Calendar,
  FileSpreadsheet,
  FileCheck,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';
import {
  AuthUser,
  MoeStatutoryReport,
  MoeReportCategory,
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
import { exportToExcel } from '../utils/excelExport';

interface Props {
  currentUser: AuthUser;
  statutoryReports: MoeStatutoryReport[];
  suffixAudits: InstitutionalSuffixAudit[];
  knecMappings: KnecLearnerMappingRecord[];
  teacherWorkloads: TeacherWorkloadMatchingReturn[];
  stemLabAudits: StemLabFacilityReturn[];
  sanitationAudits: SanitationRatioReturn[];
  capitationReconciliations: CapitationReconciliationReturn[];
  uniformReturns: UniformCostControlReturn[];
  sneReturns: SneAssessmentReturn[];
  safetyReturns: ComprehensiveSafetyReturn[];
  transitionReturns: SeniorTransitionComplianceReturn[];
  priorityItems: PriorityActionItem[];
  onUpdateStatutoryReport: (updated: MoeStatutoryReport) => void;
  onUpdateSuffixAudit: (updated: InstitutionalSuffixAudit) => void;
  onUpdateKnecMapping: (updated: KnecLearnerMappingRecord) => void;
  onUpdateTeacherWorkload: (updated: TeacherWorkloadMatchingReturn) => void;
  onUpdateStemLab: (updated: StemLabFacilityReturn) => void;
  onUpdateSanitation: (updated: SanitationRatioReturn) => void;
  onUpdateCapitationReconciliation: (updated: CapitationReconciliationReturn) => void;
  onUpdateUniformReturn: (updated: UniformCostControlReturn) => void;
  onUpdateSneReturn: (updated: SneAssessmentReturn) => void;
  onUpdateSafetyReturn: (updated: ComprehensiveSafetyReturn) => void;
  onUpdateTransitionReturn: (updated: SeniorTransitionComplianceReturn) => void;
  onLogAudit: (action: any, resource: string, details: string, sensitivity?: any) => void;
}

export function SchoolMoeComplianceReturnsModule({
  currentUser,
  statutoryReports,
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
  onUpdateStatutoryReport,
  onUpdateSuffixAudit,
  onUpdateKnecMapping,
  onUpdateTeacherWorkload,
  onUpdateStemLab,
  onUpdateSanitation,
  onUpdateCapitationReconciliation,
  onUpdateUniformReturn,
  onUpdateSneReturn,
  onUpdateSafetyReturn,
  onUpdateTransitionReturn,
  onLogAudit,
}: Props) {
  type ReturnTab =
    | 'financial-audits'
    | 'schemes-curriculum'
    | 'statutory-reports'
    | 'data-audits-knec'
    | 'facilities-safety'
    | 'transition-welfare';

  const [activeTab, setActiveTab] = useState<ReturnTab>('financial-audits');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Upload Modals
  const [isUploadAuditModalOpen, setIsUploadAuditModalOpen] = useState(false);
  const [isUploadBudgetModalOpen, setIsUploadBudgetModalOpen] = useState(false);
  const [isUploadSchemeModalOpen, setIsUploadSchemeModalOpen] = useState(false);
  const [isExcelUploadModalOpen, setIsExcelUploadModalOpen] = useState(false);

  // Seamless Editing Target
  const [editingReport, setEditingReport] = useState<MoeStatutoryReport | null>(null);
  const [editingSuffix, setEditingSuffix] = useState<InstitutionalSuffixAudit | null>(null);
  const [editingKnec, setEditingKnec] = useState<KnecLearnerMappingRecord | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<TeacherWorkloadMatchingReturn | null>(null);
  const [editingStemLab, setEditingStemLab] = useState<StemLabFacilityReturn | null>(null);
  const [editingSanitation, setEditingSanitation] = useState<SanitationRatioReturn | null>(null);
  const [editingCapitation, setEditingCapitation] = useState<CapitationReconciliationReturn | null>(null);
  const [editingUniform, setEditingUniform] = useState<UniformCostControlReturn | null>(null);
  const [editingSne, setEditingSne] = useState<SneAssessmentReturn | null>(null);
  const [editingSafety, setEditingSafety] = useState<ComprehensiveSafetyReturn | null>(null);
  const [editingTransition, setEditingTransition] = useState<SeniorTransitionComplianceReturn | null>(null);

  // Printable Modal State
  const [printableDossier, setPrintableDossier] = useState<{
    title: string;
    refNo: string;
    category: string;
    details: Record<string, string | number>;
    notes?: string;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Quick audit helper
  const handleEditSave = (type: string, id: string) => {
    showToast(`Seamlessly updated and synchronized ${type} (#${id}) with Ministry of Education.`);
    onLogAudit(
      'MOE_COMPLIANCE_EDIT',
      `School Statutory Return (${type})`,
      `Updated return record ${id}. Synchronized with County Directorate portal.`,
      'Confidential'
    );
  };

  // Filtered Limuru records for school view
  const schoolStatutoryReports = statutoryReports.filter((r) =>
    r.schoolName.toLowerCase().includes('limuru') || r.centerCode === '20401823'
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-500 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =========================================================================
          HERO BANNER: CENTERED MAJESTIC TITLE & SUB-COUNTY ACCREDITATION
          ========================================================================= */}
      <div className="bg-gradient-to-b from-emerald-900 via-emerald-850 to-teal-950 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-emerald-700/60 relative overflow-hidden text-center">
        {/* Subtle background crest watermark */}
        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
          <Building2 className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-mono font-bold tracking-wide uppercase mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>School-Side Ministry of Education Statutory Reporting & Audit Desk</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white drop-shadow-sm flex items-center justify-center gap-3 flex-wrap">
            <span>Limuru Model Comprehensive School</span>
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-emerald-200 max-w-3xl leading-relaxed">
            Statutory Document Uploads · Audited Financial Statements · Annual Budgets · CBC Schemes of Work · KEMIS/NEMIS Verification Returns · SCDE Direct Line
          </p>

          {/* Quick Action Badges */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            <button
              onClick={() => setIsUploadAuditModalOpen(true)}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center gap-2 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Audited Financials</span>
            </button>
            <button
              onClick={() => setIsUploadBudgetModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-2 transition-all border border-emerald-400/30"
            >
              <DollarSign className="w-4 h-4" />
              <span>Upload Annual Budget</span>
            </button>
            <button
              onClick={() => setIsUploadSchemeModalOpen(true)}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-2 transition-all border border-teal-400/30"
            >
              <BookOpen className="w-4 h-4" />
              <span>Upload Schemes of Work</span>
            </button>
            <button
              onClick={() => setIsExcelUploadModalOpen(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center gap-2 transition-all border border-slate-600"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Excel Batch Import</span>
            </button>
          </div>

          {/* Status Metrics Strip */}
          <div className="mt-6 pt-5 border-t border-emerald-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full text-center">
            <div className="bg-emerald-950/40 rounded-xl p-2.5 border border-emerald-600/30">
              <span className="text-[11px] text-emerald-300 block">MoE Center Code</span>
              <strong className="text-sm font-mono text-white">20401823</strong>
            </div>
            <div className="bg-emerald-950/40 rounded-xl p-2.5 border border-emerald-600/30">
              <span className="text-[11px] text-emerald-300 block">KEMIS Status</span>
              <strong className="text-sm font-semibold text-emerald-400">100% Synced</strong>
            </div>
            <div className="bg-emerald-950/40 rounded-xl p-2.5 border border-emerald-600/30">
              <span className="text-[11px] text-emerald-300 block">Statutory Compliance</span>
              <strong className="text-sm font-semibold text-amber-300">96.4% Verified</strong>
            </div>
            <div className="bg-emerald-950/40 rounded-xl p-2.5 border border-emerald-600/30">
              <span className="text-[11px] text-emerald-300 block">SCDE Inspection Stamp</span>
              <strong className="text-sm font-semibold text-teal-300">Valid (2026/T1)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SUB-NAVIGATION TABS
          ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-xl p-1.5 shadow-xs flex flex-wrap gap-1">
        {[
          { id: 'financial-audits', label: '1. Financial Audits & Budgets', icon: DollarSign },
          { id: 'schemes-curriculum', label: '2. Schemes of Work & CBC', icon: BookOpen },
          { id: 'statutory-reports', label: '3. All 12 Statutory Returns', icon: FileText },
          { id: 'data-audits-knec', label: '4. NEMIS Suffix & KNEC Mapping', icon: Layers },
          { id: 'facilities-safety', label: '5. STEM Labs, Ratios & Safety', icon: Building2 },
          { id: 'transition-welfare', label: '6. 100% Transition & Welfare', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ReturnTab)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: FINANCIAL AUDITS, BUDGETS & CAPITATION RECONCILIATIONS
          ========================================================================= */}
      {activeTab === 'financial-audits' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-700" />
                <span>Financial Management & Accountability Returns</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Upload and manage certified Annual Audited Financial Statements, BOM Approved Procurement Budgets, and SCDE Bank Account Reconciliations.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsUploadAuditModalOpen(true)}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New Audit Report</span>
              </button>
              <button
                onClick={() => setIsUploadBudgetModalOpen(true)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Upload BOM Budget</span>
              </button>
            </div>
          </div>

          {/* Cards Grid: Financial Reports for Limuru Model School */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {schoolStatutoryReports
              .filter((r) => r.category === 'Financial Management & Accountability')
              .map((rep) => (
                <div
                  key={rep.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col hover:border-emerald-300 transition-all"
                >
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                        REF: {rep.officialRefNumber}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">{rep.reportName}</h3>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rep.status === 'Verified & Endorsed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : rep.status === 'Pending Review'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {rep.status}
                    </span>
                  </div>

                  <div className="p-4 space-y-3 flex-1 text-xs">
                    <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100 space-y-1">
                      <div className="flex justify-between text-slate-700">
                        <span className="text-slate-500">Academic Term:</span>
                        <span className="font-semibold">{rep.academicYear} · {rep.term}</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span className="text-slate-500">Compliance Rating:</span>
                        <span className="font-bold text-emerald-700">{rep.complianceRatingPercent}%</span>
                      </div>
                      {rep.auditorName && (
                        <div className="flex justify-between text-slate-700">
                          <span className="text-slate-500">Auditor:</span>
                          <span className="font-medium text-slate-800">{rep.auditorName}</span>
                        </div>
                      )}
                      {rep.budgetApprovedAmountKes && (
                        <div className="flex justify-between text-slate-700">
                          <span className="text-slate-500">Approved Budget:</span>
                          <span className="font-bold text-emerald-700">
                            KES {rep.budgetApprovedAmountKes.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Attached Document File Info */}
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200 text-[11px]">
                      <FileCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                      <div className="flex-1 truncate">
                        <span className="font-medium text-slate-800 block truncate">
                          {rep.uploadedFileName || `${rep.reportName.replace(/\s+/g, '_')}_Signed_Return.pdf`}
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          {rep.uploadedFileSize || '2.4 MB'} · Submitted on {rep.submissionDate}
                        </span>
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100">
                      {Object.entries(rep.summaryMetrics).map(([k, v]) => (
                        <div key={k} className="bg-slate-50 p-1.5 rounded">
                          <span className="text-slate-400 block text-[10px]">{k}</span>
                          <span className="font-bold text-slate-800">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions & Seamless Editing Link */}
                  <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
                    <button
                      onClick={() => setEditingReport(rep)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-bold flex items-center gap-1.5 transition-colors"
                      title="Seamlessly edit this statutory return record"
                    >
                      <Edit className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Edit Return</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          setPrintableDossier({
                            title: rep.reportName,
                            refNo: rep.officialRefNumber,
                            category: rep.category,
                            details: {
                              ...rep.summaryMetrics,
                              'School Name': rep.schoolName,
                              'Center Code': rep.centerCode,
                              'Academic Term': `${rep.academicYear} - ${rep.term}`,
                              'Status': rep.status,
                              'Auditor Firm': rep.auditorName || 'OAG County Auditor',
                            },
                            notes: rep.keyContentsAndPurpose,
                          })
                        }
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
                        title="Print Official MoE Return Dossier"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          exportToExcel(
                            `MoE_Return_${rep.reportName.replace(/\s+/g, '_')}`,
                            [rep],
                            [
                              { header: 'Ref No', key: 'officialRefNumber' },
                              { header: 'Report Name', key: 'reportName' },
                              { header: 'School Name', key: 'schoolName' },
                              { header: 'Center Code', key: 'centerCode' },
                              { header: 'Submission Date', key: 'submissionDate' },
                              { header: 'Status', key: 'status' },
                              { header: 'Compliance %', key: 'complianceRatingPercent' },
                            ]
                          );
                          showToast('Exported return record to Excel.');
                        }}
                        className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-slate-200 rounded transition-colors"
                        title="Export to Excel"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Capitation Reconciliation & Bank Account Audit Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Capitation Receipt Uploads & SCDE-Locked Bank Accounts
                </h3>
                <p className="text-xs text-slate-500">
                  Ministry Votehead funding confirmations (Tuition vs. Operations vs. RMI)
                </p>
              </div>
              <button
                onClick={() => {
                  const limCap = capitationReconciliations.find((c) => c.centerCode === '20401823');
                  if (limCap) setEditingCapitation(limCap);
                }}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-xs font-bold flex items-center gap-1.5 shrink-0"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Capitation Details</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">School & Suffix</th>
                    <th className="p-3">Expected (KES)</th>
                    <th className="p-3">Actual Disbursed</th>
                    <th className="p-3">Shortfall Debt</th>
                    <th className="p-3">Official Receipt Ref</th>
                    <th className="p-3">Verified Bank Account</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {capitationReconciliations.map((cap) => (
                    <tr key={cap.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">
                        {cap.schoolName}
                        <span className="block text-[10px] text-slate-500 font-normal">{cap.campusSuffix}</span>
                      </td>
                      <td className="p-3 tabular-nums font-medium text-slate-700">
                        KES {cap.expectedFundingKes.toLocaleString()}
                      </td>
                      <td className="p-3 tabular-nums font-bold text-emerald-700">
                        KES {cap.actualDisbursedKes.toLocaleString()}
                      </td>
                      <td className="p-3 tabular-nums font-bold text-rose-700">
                        KES {cap.shortfallDebtCarriedKes.toLocaleString()}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-600">
                        {cap.officialReceiptVoucherRef}
                      </td>
                      <td className="p-3 text-slate-700">
                        <span className="font-medium block">{cap.scdeVerifiedBank}</span>
                        <span className="font-mono text-[10px] text-slate-500">{cap.bankAccountMasked}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {cap.bankVerificationStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setEditingCapitation(cap)}
                          className="px-2.5 py-1 text-xs text-emerald-700 hover:text-emerald-900 font-bold hover:underline inline-flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
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
          TAB 2: SCHEMES OF WORK, SYLLABUS & CBC CURRICULUM PERFORMANCE
          ========================================================================= */}
      {activeTab === 'schemes-curriculum' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-700" />
                <span>CBC Schemes of Work & Records of Work Done</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Curriculum syllabus coverage monitoring, CBC strand logs, and official returns for Directorate of Quality Assurance and Standards (DQASO).
              </p>
            </div>
            <button
              onClick={() => setIsUploadSchemeModalOpen(true)}
              className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Scheme of Work</span>
            </button>
          </div>

          {/* Schemes & Curriculum Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {schoolStatutoryReports
              .filter((r) => r.category === 'Curriculum & Academic Performance')
              .map((rep) => (
                <div
                  key={rep.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col hover:border-teal-300 transition-all"
                >
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                        REF: {rep.officialRefNumber}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">{rep.reportName}</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {rep.status}
                    </span>
                  </div>

                  <div className="p-4 space-y-3 flex-1 text-xs">
                    <p className="text-slate-600 text-[11px] leading-relaxed">{rep.keyContentsAndPurpose}</p>

                    <div className="bg-teal-50/60 p-2.5 rounded-lg border border-teal-100 space-y-1">
                      <div className="flex justify-between text-slate-700">
                        <span className="text-slate-500">DQASO Endorsement:</span>
                        <span className="font-bold text-teal-800">
                          {rep.verifiedByOfficer || 'Kiambu DQASO Standards Team'}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span className="text-slate-500">Syllabus Coverage:</span>
                        <span className="font-bold text-emerald-700">
                          {rep.syllabusCoveragePercent || 94.8}%
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span className="text-slate-500">Academic Term:</span>
                        <span className="font-medium">{rep.academicYear} · {rep.term}</span>
                      </div>
                    </div>

                    {/* File Attachment */}
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200 text-[11px]">
                      <FileCheck className="w-4 h-4 text-teal-700 shrink-0" />
                      <div className="flex-1 truncate">
                        <span className="font-medium text-slate-800 block truncate">
                          {rep.uploadedFileName || `Limuru_Model_${rep.reportName.replace(/\s+/g, '_')}_Term1.pdf`}
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          {rep.uploadedFileSize || '3.1 MB'} · Approved by Headteacher
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
                    <button
                      onClick={() => setEditingReport(rep)}
                      className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 rounded font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5 text-teal-700" />
                      <span>Edit Return</span>
                    </button>

                    <button
                      onClick={() =>
                        setPrintableDossier({
                          title: rep.reportName,
                          refNo: rep.officialRefNumber,
                          category: rep.category,
                          details: {
                            ...rep.summaryMetrics,
                            'School Name': rep.schoolName,
                            'Center Code': rep.centerCode,
                            'DQASO Officer': rep.verifiedByOfficer || 'County QASO',
                            'Coverage %': `${rep.syllabusCoveragePercent || 94.8}%`,
                          },
                          notes: rep.whyCrucial,
                        })
                      }
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
                      title="Print Official Return"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Teacher Workload & TPAD Matching Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Teacher Performance & Subject-to-Teacher Matching (TPAD Integration)
                </h3>
                <p className="text-xs text-slate-500">
                  Utilization rates and STEM/practical subject shortage mapping
                </p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs">
                {teacherWorkloads.length} Staff Mapped
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">TSC No & Teacher Name</th>
                    <th className="p-3">School & Campus</th>
                    <th className="p-3">Subjects Specialization</th>
                    <th className="p-3">Lessons / Wk</th>
                    <th className="p-3">Utilization Status</th>
                    <th className="p-3">Shortage Flag</th>
                    <th className="p-3">TPAD Rating</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {teacherWorkloads.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">
                        {t.teacherName}
                        <span className="block text-[10px] text-slate-500 font-mono">TSC: {t.tscNumber}</span>
                      </td>
                      <td className="p-3 text-slate-700">
                        {t.schoolName}
                        <span className="block text-[10px] text-slate-500">{t.campusSuffix}</span>
                      </td>
                      <td className="p-3 text-slate-800">
                        <span className="font-medium">{t.assignedSubjects.join(', ')}</span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-800">{t.lessonsPerWeek}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.utilizationRatePercent >= 100
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {t.utilizationStatus} ({t.utilizationRatePercent}%)
                        </span>
                      </td>
                      <td className="p-3">
                        {t.criticalShortageAreaFlag ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                            {t.shortageSubjectName} Shortage
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Optimal</span>
                        )}
                      </td>
                      <td className="p-3 font-bold text-emerald-700">{t.tpadScore}%</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setEditingTeacher(t)}
                          className="px-2.5 py-1 text-xs text-teal-700 hover:text-teal-900 font-bold hover:underline inline-flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
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
          TAB 3: ALL 12 STATUTORY MOE RETURNS (MASTER LISTING)
          ========================================================================= */}
      {activeTab === 'statutory-reports' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-700" />
                <span>All 12 Mandatory Ministry of Education Statutory Returns</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Covers Enrollment & NEMIS, Financial Accountability, Curriculum Delivery, and Institutional Health & Governance.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white"
              >
                <option value="All">All Categories</option>
                <option value="Enrollment & Learner Data">Enrollment & Learner Data</option>
                <option value="Financial Management & Accountability">Financial Management & Accountability</option>
                <option value="Curriculum & Academic Performance">Curriculum & Academic Performance</option>
                <option value="Institutional Health, Safety & Governance">Institutional Health, Safety & Governance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {schoolStatutoryReports
              .filter((r) => filterCategory === 'All' || r.category === filterCategory)
              .map((rep) => (
                <div
                  key={rep.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 hover:border-emerald-400 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                          REF: {rep.officialRefNumber} · {rep.category}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 mt-0.5">{rep.reportName}</h3>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rep.status === 'Verified & Endorsed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rep.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <strong className="text-slate-800 block text-[11px]">Key Contents & Purpose:</strong>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{rep.keyContentsAndPurpose}</p>
                      </div>
                      <div className="bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/60">
                        <strong className="text-amber-900 block text-[11px]">Why It Is Crucial:</strong>
                        <p className="text-amber-800 text-[11px] leading-relaxed">{rep.whyCrucial}</p>
                      </div>
                    </div>

                    {/* Metrics Table */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                      {Object.entries(rep.summaryMetrics).map(([k, v]) => (
                        <div key={k} className="bg-slate-50 p-2 rounded">
                          <span className="text-slate-400 block text-[10px] truncate">{k}</span>
                          <span className="font-bold text-slate-800 truncate block">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer & Edit Link */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => setEditingReport(rep)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Return Details</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setPrintableDossier({
                            title: rep.reportName,
                            refNo: rep.officialRefNumber,
                            category: rep.category,
                            details: rep.summaryMetrics,
                            notes: `${rep.keyContentsAndPurpose}\n\nWhy Crucial:\n${rep.whyCrucial}`,
                          })
                        }
                        className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded flex items-center gap-1 text-[11px] font-semibold"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Return</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: KEMIS / NEMIS SUFFIX & KNEC IDENTIFIER MAPPING
          ========================================================================= */}
      {activeTab === 'data-audits-knec' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-700" />
                <span>NEMIS Suffix Verification (_PS / _JS) & KNEC Mapping</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Executive Directive compliance: Distinguish Primary and Junior Secondary streams on shared compound, mapping all UPIs to KNEC index numbers.
              </p>
            </div>
            <button
              onClick={() => {
                const lim = suffixAudits.find((s) => s.baseCode === '20401823');
                if (lim) setEditingSuffix(lim);
              }}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs shrink-0"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Suffix Return</span>
            </button>
          </div>

          {/* Suffix Split Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {suffixAudits
              .filter((s) => s.baseCode === '20401823' || s.schoolName.includes('Limuru'))
              .map((suf) => (
                <div key={suf.id} className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase block">
                        CODE: {suf.suffixCode}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{suf.schoolName}</h3>
                      <span className="text-xs text-slate-500 font-medium">{suf.campusType}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {suf.ghostSchoolRiskIndex}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Registration Cert No:</span>
                      <span className="font-mono font-bold text-slate-800">{suf.sharedRegistrationCertNo}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Acreage / Compound:</span>
                      <span className="font-bold text-slate-800">{suf.acreage} Acres (Shared Compound)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Enrolled Learners:</span>
                      <span className="font-bold text-emerald-700">{suf.enrolledLearners} Students</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Verified KEMIS Headcount:</span>
                      <span className="font-bold text-teal-700">{suf.verifiedKemisHeadcount} Validated</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 text-[11px]">Separate Digital Ledger Maintained: Yes</span>
                    <button
                      onClick={() => setEditingSuffix(suf)}
                      className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 rounded text-xs inline-flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit Record</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* KNEC Learner Mapping Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  KNEC Assessment Identifier Mapping Returns
                </h3>
                <p className="text-xs text-slate-500">
                  Linking learner NEMIS UPIs directly to KNEC KPSEA/KJSEA index numbers
                </p>
              </div>
              <button
                onClick={() => {
                  exportToExcel(
                    'Limuru_Model_KNEC_Assessment_Mapping',
                    knecMappings,
                    [
                      { header: 'Student Name', key: 'studentName' },
                      { header: 'NEMIS UPI', key: 'nemisUpi' },
                      { header: 'KNEC Assessment Index', key: 'knecAssessmentIndex' },
                      { header: 'Birth Cert Entry', key: 'birthCertificateEntryNo' },
                      { header: 'Grade', key: 'grade' },
                      { header: 'Assessment Exam', key: 'assessmentExam' },
                      { header: 'Mapping Status', key: 'mappingStatus' },
                    ]
                  );
                  showToast('Exported KNEC Mapping return.');
                }}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:bg-slate-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Mapping Excel</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Learner Name</th>
                    <th className="p-3">NEMIS UPI</th>
                    <th className="p-3">Birth Certificate</th>
                    <th className="p-3">KNEC Assessment Index</th>
                    <th className="p-3">Exam Target</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {knecMappings.map((km) => (
                    <tr key={km.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">{km.studentName}</td>
                      <td className="p-3 font-mono text-[11px] text-emerald-800 font-bold">{km.nemisUpi}</td>
                      <td className="p-3 font-mono text-slate-600">{km.birthCertificateEntryNo}</td>
                      <td className="p-3 font-mono font-bold text-teal-800">{km.knecAssessmentIndex}</td>
                      <td className="p-3 text-slate-700">{km.assessmentExam} ({km.grade})</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {km.mappingStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setEditingKnec(km)}
                          className="px-2.5 py-1 text-xs text-emerald-700 hover:text-emerald-900 font-bold hover:underline inline-flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
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
          TAB 5: STEM LABS, SANITATION RATIOS & SAFETY CERTIFICATES
          ========================================================================= */}
      {activeTab === 'facilities-safety' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-700" />
                <span>STEM Laboratories, Sanitation Ratios & Structural Safety</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Audits of science lab apparatus, chemical reagents certs, learner-to-toilet ratios, and dormitory safety mechanisms.
              </p>
            </div>
          </div>

          {/* STEM Lab Return Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {stemLabAudits.map((lab) => (
              <div key={lab.id} className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{lab.schoolName}</h3>
                    <span className="text-xs text-slate-500 font-mono">Code: {lab.centerCode}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {lab.integratedScienceLabStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Functional Microscopes:</span>
                    <span className="font-bold text-emerald-700">{lab.functionalMicroscopes} Units</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Defective Microscopes:</span>
                    <span className="font-bold text-rose-700">{lab.defectiveMicroscopes} Units</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Chemical Reagents Cert:</span>
                    <span className="font-semibold text-slate-800">{lab.chemicalReagentsCertStatus}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Power Grid Status:</span>
                    <span className="font-semibold text-slate-800">{lab.powerGridStatus}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Digital Devices / Ratio:</span>
                    <span className="font-bold text-teal-700">{lab.functionalTabletsLaptops} ({lab.learnerToDeviceRatio})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Fume Extraction System:</span>
                    <span className="font-bold text-slate-800">{lab.fumeExtractionSystem ? 'Installed' : 'None'}</span>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setEditingStemLab(lab)}
                    className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 rounded text-xs inline-flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Edit Lab Audit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sanitation Ratio Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Learner-to-Sanitation & Classroom Ratios</h3>
                <p className="text-xs text-slate-500">Benchmark: Boys 1:30, Girls 1:25, Classrooms 1:45</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">School Name</th>
                    <th className="p-3">Boys / Toilets</th>
                    <th className="p-3">Boy Ratio</th>
                    <th className="p-3">Girls / Toilets</th>
                    <th className="p-3">Girl Ratio</th>
                    <th className="p-3">Classrooms / Ratio</th>
                    <th className="p-3">Compliance</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sanitationAudits.map((san) => (
                    <tr key={san.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">{san.schoolName}</td>
                      <td className="p-3">{san.totalBoys} / {san.boysLatrinesToilets}</td>
                      <td className="p-3 font-bold text-slate-800">{san.boyToToiletRatio}</td>
                      <td className="p-3">{san.totalGirls} / {san.girlsLatrinesToilets}</td>
                      <td className="p-3 font-bold text-slate-800">{san.girlToToiletRatio}</td>
                      <td className="p-3">{san.totalClassrooms} ({san.learnerToClassroomRatio})</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {san.sanitationCompliance}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setEditingSanitation(san)}
                          className="px-2.5 py-1 text-xs text-emerald-700 hover:text-emerald-900 font-bold hover:underline inline-flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Comprehensive Safety & Dormitory Compliance Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Fire & Structural Safety Certificates</h3>
                <p className="text-xs text-slate-500">Outward-opening panic bolts and county fire marshal sign-offs</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">School Name</th>
                    <th className="p-3">Fire Cert No</th>
                    <th className="p-3">Extinguishers</th>
                    <th className="p-3">Dormitory Doors</th>
                    <th className="p-3">Perimeter Fence</th>
                    <th className="p-3">Fire Marshal Sign-off</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {safetyReturns.map((saf) => (
                    <tr key={saf.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">{saf.schoolName}</td>
                      <td className="p-3 font-mono text-emerald-800">{saf.fireSafetyCertNumber}</td>
                      <td className="p-3 font-bold">{saf.fireExtinguishersCount} Serviced</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {saf.dormitoryDoorMechanism}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700">{saf.perimeterMasonryFenceStatus}</td>
                      <td className="p-3 font-medium text-slate-800">{saf.countyFireMarshalSignOffDate}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setEditingSafety(saf)}
                          className="px-2.5 py-1 text-xs text-emerald-700 hover:text-emerald-900 font-bold hover:underline inline-flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
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
          TAB 6: 100% TRANSITION & LEARNER WELFARE
          ========================================================================= */}
      {activeTab === 'transition-welfare' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-700" />
                <span>Unconditional Senior Secondary (100% Transition) & Uniform Controls</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Zero-rejection policy for Grade 10 admissions, uniform price caps (KES 3,500 ceiling), and Special Needs (SNE) assessments.
              </p>
            </div>
          </div>

          {/* Uniform Cost Controls Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Uniform Cost Disclosure Returns</h3>
                <p className="text-xs text-slate-500">Ministry Price Cap Guideline: Maximum KES 3,500</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">School Name</th>
                    <th className="p-3">Compulsory Items</th>
                    <th className="p-3">Package Cost (KES)</th>
                    <th className="p-3">Price Ceiling (KES)</th>
                    <th className="p-3">Commercialization Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {uniformReturns.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">{u.schoolName}</td>
                      <td className="p-3 text-slate-700">{u.compulsoryItemsList.join(', ')}</td>
                      <td className="p-3 font-bold text-slate-900">KES {u.schoolPackageTotalCostKes.toLocaleString()}</td>
                      <td className="p-3 text-slate-500">KES {u.ministryCeilingGuidelineKes.toLocaleString()}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.commercializationStatus.includes('Compliant')
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {u.commercializationStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setEditingUniform(u)}
                          className="px-2.5 py-1 text-xs text-emerald-700 hover:text-emerald-900 font-bold hover:underline inline-flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 100% Transition Tracking Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Grade 10 Senior Secondary Transition Log</h3>
                <p className="text-xs text-slate-500">Tracking learners admitted without uniform or fee barriers</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Learner Name</th>
                    <th className="p-3">NEMIS UPI</th>
                    <th className="p-3">Junior School Origin</th>
                    <th className="p-3">Senior School</th>
                    <th className="p-3">Admission Status</th>
                    <th className="p-3">Fee Waived</th>
                    <th className="p-3">Uniform Flex</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {transitionReturns.map((tr) => (
                    <tr key={tr.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">{tr.learnerName}</td>
                      <td className="p-3 font-mono text-emerald-800">{tr.nemisUpi}</td>
                      <td className="p-3 text-slate-700">{tr.juniorSchoolOrigin}</td>
                      <td className="p-3 text-slate-700">{tr.seniorSchoolAssigned}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {tr.admissionStatus}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-emerald-700">{tr.feeLeviesWaived ? 'Yes (Waived)' : 'No'}</td>
                      <td className="p-3 font-bold text-teal-700">{tr.uniformFlexibilityGranted ? 'Granted' : 'Standard'}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setEditingTransition(tr)}
                          className="px-2.5 py-1 text-xs text-emerald-700 hover:text-emerald-900 font-bold hover:underline inline-flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SNE Special Needs Allocations Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Special Needs Education (SNE) Assessment Returns</h3>
                <p className="text-xs text-slate-500">Validated by Educational Assessment & Resource Centre (EARC)</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Learner Name</th>
                    <th className="p-3">NEMIS UPI</th>
                    <th className="p-3">EARC Report No</th>
                    <th className="p-3">Disability Category</th>
                    <th className="p-3">Specialized Grant (KES)</th>
                    <th className="p-3">Verification Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sneReturns.map((sn) => (
                    <tr key={sn.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">{sn.learnerName}</td>
                      <td className="p-3 font-mono text-emerald-800">{sn.nemisUpi}</td>
                      <td className="p-3 font-mono font-bold text-teal-800">{sn.earcReportNumber}</td>
                      <td className="p-3 text-slate-800">{sn.disabilityCategory}</td>
                      <td className="p-3 font-bold text-emerald-700">
                        KES {sn.approvedSNEGrantPerAnnumKes.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {sn.verificationStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setEditingSne(sn)}
                          className="px-2.5 py-1 text-xs text-emerald-700 hover:text-emerald-900 font-bold hover:underline inline-flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
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
          MODAL 1: UPLOAD AUDITED FINANCIAL REPORT
          ========================================================================= */}
      {isUploadAuditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-gradient-to-r from-emerald-950 to-teal-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Upload className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Upload Annual Audited Financial Statements</h3>
              </div>
              <button
                onClick={() => setIsUploadAuditModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const reportTitle = 'Annual Audited Financial Statements';
                const auditorName = String(formData.get('auditorName') || 'Auditor General / Certified CPA');
                const opinion = String(formData.get('auditOpinion') || 'Unqualified Clean Opinion') as any;

                const targetReport = statutoryReports.find((r) => r.reportName === reportTitle);
                if (targetReport) {
                  onUpdateStatutoryReport({
                    ...targetReport,
                    status: 'Verified & Endorsed',
                    auditorName,
                    auditOpinion: opinion,
                    uploadedFileName: `${auditorName.replace(/\s+/g, '_')}_Audit_2026.pdf`,
                    uploadedFileSize: '4.8 MB',
                    uploadedDate: new Date().toISOString().substring(0, 10),
                    complianceRatingPercent: 98,
                  });
                }
                setIsUploadAuditModalOpen(false);
                handleEditSave('Audited Financial Statement', 'AFS-2026');
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Audit Firm / Agency Name</label>
                <input
                  name="auditorName"
                  defaultValue="Office of the Auditor General (OAG Kenya) / PKF East Africa"
                  required
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Financial Year</label>
                  <input
                    name="financialYear"
                    defaultValue="2025/2026"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Audit Opinion</label>
                  <select
                    name="auditOpinion"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-emerald-800"
                  >
                    <option value="Unqualified Clean Opinion">Unqualified Clean Opinion</option>
                    <option value="Qualified with Explanatory Notes">Qualified with Notes</option>
                    <option value="Adverse / Material Discrepancy">Adverse / Discrepancy</option>
                  </select>
                </div>
              </div>

              {/* Drag and drop zone */}
              <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/40 rounded-xl p-6 text-center space-y-2">
                <FileCheck className="w-8 h-8 text-emerald-700 mx-auto" />
                <span className="block font-bold text-slate-800">
                  Select Certified Audit Dossier (PDF or XLSX)
                </span>
                <span className="block text-[11px] text-slate-500">
                  Attach signed Trial Balance, Balance Sheet, and Capitation Bank Reconciliation
                </span>
                <input
                  type="file"
                  accept=".pdf,.xlsx,.xls"
                  className="block mx-auto text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-700 file:text-white hover:file:bg-emerald-800 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsUploadAuditModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs"
                >
                  Submit & Sync with MoE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: UPLOAD APPROVED ANNUAL BUDGET & PROCUREMENT PLAN
          ========================================================================= */}
      {isUploadBudgetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-gradient-to-r from-emerald-950 to-teal-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Upload Approved Annual Budget & Procurement Plan</h3>
              </div>
              <button
                onClick={() => setIsUploadBudgetModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const approvedAmount = Number(formData.get('approvedAmount') || 8420000);
                const bomMinuteRef = String(formData.get('bomMinuteRef') || 'BOM/MIN/2026/02-4');

                const targetReport = statutoryReports.find(
                  (r) => r.reportName === 'Approved Annual Budget & Procurement Plan'
                );
                if (targetReport) {
                  onUpdateStatutoryReport({
                    ...targetReport,
                    status: 'Verified & Endorsed',
                    budgetApprovedAmountKes: approvedAmount,
                    bomMinuteRef,
                    uploadedFileName: `Approved_BOM_Budget_${bomMinuteRef.replace(/[\/\s]/g, '_')}.xlsx`,
                    uploadedFileSize: '1.9 MB',
                    uploadedDate: new Date().toISOString().substring(0, 10),
                    complianceRatingPercent: 96,
                  });
                }
                setIsUploadBudgetModalOpen(false);
                handleEditSave('Annual Budget Plan', 'BUDGET-2026');
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  BOM Approval Minute Reference
                </label>
                <input
                  name="bomMinuteRef"
                  defaultValue="BOM/MIN/2026/02-4 (Passed by Board of Management)"
                  required
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Total Approved Budget (KES)
                  </label>
                  <input
                    type="number"
                    name="approvedAmount"
                    defaultValue={8420000}
                    required
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-bold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Votehead Focus</label>
                  <select
                    name="voteheadFocus"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-semibold"
                  >
                    <option value="Tuition + Operational + Infrastructure">Balanced MoE Voteheads</option>
                    <option value="RMI Maintenance Priority">RMI Infrastructure</option>
                  </select>
                </div>
              </div>

              <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/40 rounded-xl p-6 text-center space-y-2">
                <FileSpreadsheet className="w-8 h-8 text-emerald-700 mx-auto" />
                <span className="block font-bold text-slate-800">
                  Select BOM Approved Spreadsheet (Excel / PDF)
                </span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.pdf"
                  className="block mx-auto text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-700 file:text-white hover:file:bg-emerald-800 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsUploadBudgetModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs"
                >
                  Upload & Gazet with MoE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: UPLOAD SCHEME OF WORK & CBC RECORDS
          ========================================================================= */}
      {isUploadSchemeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-gradient-to-r from-teal-950 to-emerald-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-sm">Upload Schemes of Work & Records of Work Done</h3>
              </div>
              <button
                onClick={() => setIsUploadSchemeModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const gradeStr = String(formData.get('grade') || 'Grade 7-9 JSS');
                const coverage = Number(formData.get('coverage') || 95);

                const targetReport = statutoryReports.find(
                  (r) => r.reportName === 'Schemes of Work & Records of Work Done'
                );
                if (targetReport) {
                  onUpdateStatutoryReport({
                    ...targetReport,
                    status: 'Verified & Endorsed',
                    syllabusCoveragePercent: coverage,
                    schemeOfWorkTerm: 'Term 1 2026',
                    uploadedFileName: `Limuru_${gradeStr.replace(/\s+/g, '_')}_Schemes_Term1.pdf`,
                    uploadedFileSize: '3.6 MB',
                    uploadedDate: new Date().toISOString().substring(0, 10),
                    complianceRatingPercent: 97,
                  });
                }
                setIsUploadSchemeModalOpen(false);
                handleEditSave('Schemes of Work Return', 'SOW-2026-T1');
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Grade Stream</label>
                  <select
                    name="grade"
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-semibold"
                  >
                    <option value="Grade 7-9 Junior Secondary">Grade 7-9 (Junior Secondary)</option>
                    <option value="Grade 1-6 Primary Campus">Grade 1-6 (Primary Campus)</option>
                    <option value="All Grades 1-9">Comprehensive (All Grades)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Syllabus Coverage (%)</label>
                  <input
                    type="number"
                    name="coverage"
                    defaultValue={95}
                    min={1}
                    max={100}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-bold text-teal-800"
                  />
                </div>
              </div>

              <div className="border-2 border-dashed border-teal-300 bg-teal-50/40 rounded-xl p-6 text-center space-y-2">
                <FileCheck className="w-8 h-8 text-teal-700 mx-auto" />
                <span className="block font-bold text-slate-800">
                  Select Schemes of Work Document
                </span>
                <span className="block text-[11px] text-slate-500">
                  Includes strand progress logs, pedagogical tasks, and DQASO lesson observation notes
                </span>
                <input
                  type="file"
                  accept=".pdf,.docx,.xlsx"
                  className="block mx-auto text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-teal-700 file:text-white hover:file:bg-teal-800 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsUploadSchemeModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold shadow-xs"
                >
                  Submit to DQASO Inspectorate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          SEAMLESS EDIT MODAL: GENERIC EDIT FOR STATUTORY REPORTS
          ========================================================================= */}
      {editingReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-gradient-to-r from-emerald-950 to-teal-950 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-300 font-mono uppercase block">
                  REF: {editingReport.officialRefNumber}
                </span>
                <h3 className="font-bold text-sm">Edit Return: {editingReport.reportName}</h3>
              </div>
              <button onClick={() => setEditingReport(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const status = String(formData.get('status')) as any;
                const compliance = Number(formData.get('complianceRatingPercent') || 95);
                const editNotes = String(formData.get('editNotes') || '');

                onUpdateStatutoryReport({
                  ...editingReport,
                  status,
                  complianceRatingPercent: compliance,
                  editNotes,
                  lastEditedAt: new Date().toISOString().substring(0, 16),
                  editedBy: currentUser.name,
                });
                setEditingReport(null);
                handleEditSave(editingReport.reportName, editingReport.officialRefNumber);
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Review & Endorsement Status</label>
                <select
                  name="status"
                  defaultValue={editingReport.status}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-bold text-slate-800"
                >
                  <option value="Verified & Endorsed">Verified & Endorsed</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Flagged for Audit">Flagged for Audit</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Compliance Rating (%)</label>
                <input
                  type="number"
                  name="complianceRatingPercent"
                  defaultValue={editingReport.complianceRatingPercent}
                  min={1}
                  max={100}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Administrative Notes & Rectifications</label>
                <textarea
                  name="editNotes"
                  rows={3}
                  defaultValue={editingReport.editNotes || 'All line items reconciled with Sub-County records.'}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingReport(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs"
                >
                  Save & Synchronize to MoE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          SEAMLESS EDIT MODAL: INSTITUTIONAL SUFFIX (_PS / _JS)
          ========================================================================= */}
      {editingSuffix && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-gradient-to-r from-emerald-950 to-teal-950 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-300 font-mono uppercase block">
                  CODE: {editingSuffix.suffixCode}
                </span>
                <h3 className="font-bold text-sm">Edit Suffix Verification: {editingSuffix.schoolName}</h3>
              </div>
              <button onClick={() => setEditingSuffix(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const enrolled = Number(formData.get('enrolledLearners') || editingSuffix.enrolledLearners);
                const verified = Number(formData.get('verifiedKemisHeadcount') || editingSuffix.verifiedKemisHeadcount);
                const ghostStatus = String(formData.get('ghostSchoolRiskIndex')) as any;

                onUpdateSuffixAudit({
                  ...editingSuffix,
                  enrolledLearners: enrolled,
                  verifiedKemisHeadcount: verified,
                  ghostSchoolRiskIndex: ghostStatus,
                });
                setEditingSuffix(null);
                handleEditSave('Suffix Verification', editingSuffix.suffixCode);
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Enrolled Learners</label>
                  <input
                    type="number"
                    name="enrolledLearners"
                    defaultValue={editingSuffix.enrolledLearners}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Verified KEMIS Count</label>
                  <input
                    type="number"
                    name="verifiedKemisHeadcount"
                    defaultValue={editingSuffix.verifiedKemisHeadcount}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-bold text-teal-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghost School Risk Status</label>
                <select
                  name="ghostSchoolRiskIndex"
                  defaultValue={editingSuffix.ghostSchoolRiskIndex}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-bold text-emerald-800"
                >
                  <option value="Verified Clean Operational">Verified Clean Operational</option>
                  <option value="Variance Flagged">Variance Flagged</option>
                  <option value="Ghost Anomaly Suspect">Ghost Anomaly Suspect</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingSuffix(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs"
                >
                  Update & Synchronize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          SEAMLESS EDIT MODAL: KNEC LEARNER MAPPING
          ========================================================================= */}
      {editingKnec && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-gradient-to-r from-emerald-950 to-teal-950 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-300 font-mono uppercase block">
                  UPI: {editingKnec.nemisUpi}
                </span>
                <h3 className="font-bold text-sm">Edit KNEC Identifier: {editingKnec.studentName}</h3>
              </div>
              <button onClick={() => setEditingKnec(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const knecIndex = String(formData.get('knecAssessmentIndex') || editingKnec.knecAssessmentIndex);
                const birthCert = String(formData.get('birthCertificateEntryNo') || editingKnec.birthCertificateEntryNo);

                onUpdateKnecMapping({
                  ...editingKnec,
                  knecAssessmentIndex: knecIndex,
                  birthCertificateEntryNo: birthCert,
                  mappingStatus: 'Verified 1:1 Linked',
                });
                setEditingKnec(null);
                handleEditSave('KNEC Learner Mapping', editingKnec.nemisUpi);
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">KNEC Assessment Index Number</label>
                <input
                  name="knecAssessmentIndex"
                  defaultValue={editingKnec.knecAssessmentIndex}
                  required
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-mono font-bold text-teal-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Birth Certificate Entry Number</label>
                <input
                  name="birthCertificateEntryNo"
                  defaultValue={editingKnec.birthCertificateEntryNo}
                  required
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingKnec(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs"
                >
                  Save & Validate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          SEAMLESS EDIT MODAL: CAPITATION RECONCILIATION & BANK
          ========================================================================= */}
      {editingCapitation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-gradient-to-r from-emerald-950 to-teal-950 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-300 font-mono uppercase block">
                  SCHOOL: {editingCapitation.schoolName}
                </span>
                <h3 className="font-bold text-sm">Edit Capitation Return & Bank Details</h3>
              </div>
              <button onClick={() => setEditingCapitation(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const actualDisbursed = Number(formData.get('actualDisbursedKes') || editingCapitation.actualDisbursedKes);
                const receiptVoucher = String(formData.get('officialReceiptVoucherRef') || editingCapitation.officialReceiptVoucherRef);
                const scdeBank = String(formData.get('scdeVerifiedBank') || editingCapitation.scdeVerifiedBank);

                onUpdateCapitationReconciliation({
                  ...editingCapitation,
                  actualDisbursedKes: actualDisbursed,
                  shortfallDebtCarriedKes: Math.max(0, editingCapitation.expectedFundingKes - actualDisbursed),
                  officialReceiptVoucherRef: receiptVoucher,
                  scdeVerifiedBank: scdeBank,
                  receiptUploadStatus: 'Uploaded & Reconciled',
                });
                setEditingCapitation(null);
                handleEditSave('Capitation Reconciliation', editingCapitation.centerCode);
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Actual Amount Disbursed (KES)</label>
                  <input
                    type="number"
                    name="actualDisbursedKes"
                    defaultValue={editingCapitation.actualDisbursedKes}
                    required
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-bold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Receipt Voucher Ref</label>
                  <input
                    name="officialReceiptVoucherRef"
                    defaultValue={editingCapitation.officialReceiptVoucherRef}
                    required
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">SCDE Verified Bank</label>
                <input
                  name="scdeVerifiedBank"
                  defaultValue={editingCapitation.scdeVerifiedBank}
                  required
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingCapitation(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs"
                >
                  Save & Lock Bank Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          BATCH EXCEL UPLOAD MODAL
          ========================================================================= */}
      {isExcelUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-gradient-to-r from-emerald-950 to-teal-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Batch Excel Ingestion & Template Center</h3>
              </div>
              <button onClick={() => setIsExcelUploadModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600">
                Download pre-formatted Ministry return templates, populate offline, and upload for automated validation against County Directorate records.
              </p>

              <div className="space-y-2">
                <span className="font-bold text-slate-800 block text-xs">1. Download Official Templates</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      exportToExcel('MoE_Template_Audited_Financial_Statement', [
                        { Item: 'Tuition Account Balance', Amount_KES: 4200000, Reconciled: 'Yes' },
                        { Item: 'Operations Account Balance', Amount_KES: 3100000, Reconciled: 'Yes' },
                        { Item: 'RMI Infrastructure Fund', Amount_KES: 1120000, Reconciled: 'Yes' },
                      ], [
                        { header: 'Item / Account Description', key: 'Item' },
                        { header: 'Amount (KES)', key: 'Amount_KES' },
                        { header: 'Reconciled with Bank Statement', key: 'Reconciled' },
                      ]);
                      showToast('Downloaded Financial Statement Template.');
                    }}
                    className="p-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded-lg text-left text-xs font-semibold text-slate-800 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 text-emerald-700" />
                    <span>Financial Audit Template</span>
                  </button>
                  <button
                    onClick={() => {
                      exportToExcel('MoE_Template_BOM_Approved_Budget', [
                        { Votehead: 'Tuition & Instructional Materials', Allocation_KES: 4500000 },
                        { Votehead: 'School Operations & Utilities', Allocation_KES: 2600000 },
                        { Votehead: 'Repairs, Maintenance & Improvement', Allocation_KES: 1320000 },
                      ], [
                        { header: 'Votehead Code & Title', key: 'Votehead' },
                        { header: 'Approved Allocation (KES)', key: 'Allocation_KES' },
                      ]);
                      showToast('Downloaded BOM Budget Template.');
                    }}
                    className="p-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded-lg text-left text-xs font-semibold text-slate-800 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 text-emerald-700" />
                    <span>BOM Budget Template</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-xs">2. Upload Populated Spreadsheet</span>
                <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/40 rounded-xl p-5 text-center space-y-2">
                  <FileSpreadsheet className="w-8 h-8 text-emerald-700 mx-auto" />
                  <span className="block font-bold text-slate-800">Drag & drop .xlsx or .xls file here</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="block mx-auto text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-700 file:text-white hover:file:bg-emerald-800 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsExcelUploadModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsExcelUploadModalOpen(false);
                    showToast('Successfully processed batch Excel return and synchronized 18 records.');
                    onLogAudit(
                      'MOE_EXCEL_BATCH_SYNC',
                      'School Batch Excel Return',
                      'Ingested and validated 18 statutory return line items from Excel.',
                      'Confidential'
                    );
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs"
                >
                  Process & Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          OFFICIAL PRINTABLE DOSSIER MODAL
          ========================================================================= */}
      {printableDossier && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-300 overflow-hidden my-8">
            <div className="no-print p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-amber-400">
                Print Preview · Republic of Kenya MoE Statutory Return
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setPrintableDossier(null)}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Container with Republic of Kenya Coat of Arms Header */}
            <div id="printable-area" className="p-8 sm:p-10 space-y-6 text-slate-900">
              <div className="text-center border-b-2 border-slate-900 pb-5 space-y-1">
                <div className="text-3xl">🇰🇪</div>
                <h1 className="text-base font-black uppercase tracking-wider text-slate-950">
                  REPUBLIC OF KENYA
                </h1>
                <h2 className="text-sm font-bold text-slate-800 uppercase">
                  MINISTRY OF EDUCATION · STATE DEPARTMENT FOR BASIC EDUCATION
                </h2>
                <p className="text-xs text-slate-600">
                  Kiambu County Directorate · Limuru Sub-County Education Board
                </p>
                <div className="pt-2 text-xs font-mono font-bold text-emerald-900">
                  STATUTORY RETURN DOSSIER: {printableDossier.refNo}
                </div>
              </div>

              <div className="space-y-2 text-center">
                <h3 className="text-lg font-black uppercase text-slate-900">
                  {printableDossier.title}
                </h3>
                <span className="inline-block px-3 py-1 rounded bg-slate-100 text-slate-800 text-xs font-bold border border-slate-300">
                  CATEGORY: {printableDossier.category}
                </span>
              </div>

              {/* Data Table */}
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs divide-y divide-slate-300">
                  <thead className="bg-slate-100 font-bold text-slate-800 uppercase">
                    <tr>
                      <th className="p-2.5">Field Specification</th>
                      <th className="p-2.5">Certified Value / Return Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {Object.entries(printableDossier.details).map(([key, val]) => (
                      <tr key={key}>
                        <td className="p-2.5 font-semibold text-slate-700 bg-slate-50/50">{key}</td>
                        <td className="p-2.5 font-bold text-slate-950">{String(val)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {printableDossier.notes && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <strong className="text-slate-800 block uppercase font-bold text-[11px]">
                    Official Notes & Statutory Purpose:
                  </strong>
                  <p className="text-slate-700 text-[11px] leading-relaxed whitespace-pre-line">
                    {printableDossier.notes}
                  </p>
                </div>
              )}

              {/* Statutory Signatures */}
              <div className="pt-8 border-t-2 border-slate-400 grid grid-cols-2 gap-8 text-xs">
                <div>
                  <div className="h-10 border-b border-dashed border-slate-400"></div>
                  <span className="block mt-1.5 font-bold text-slate-900">
                    Chief Principal / Head of Institution
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Accounting Officer Under Basic Education Act No. 14
                  </span>
                </div>
                <div className="text-right">
                  <div className="h-10 border-b border-dashed border-slate-400 flex items-end justify-end">
                    <span className="text-[10px] text-emerald-800 uppercase font-bold tracking-widest border border-emerald-700 px-2 py-0.5 rounded">
                      Official Institutional Seal
                    </span>
                  </div>
                  <span className="block mt-1.5 font-bold text-slate-900">
                    Sub-County Director of Education (SCDE)
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Countersigned & Gazetted on NEMIS Portal
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
