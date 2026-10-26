/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Download,
  Printer,
  Search,
  Filter,
  FileSpreadsheet,
  X,
  Layers,
  Award,
  BookOpen,
  DollarSign,
  HeartPulse,
  Flame,
  Check,
  Eye,
  ArrowRight,
  Sparkles,
  Lock,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import {
  AuthUser,
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
  onUploadExcelReturn: (category: string, count: number) => void;
  onLogAudit: (action: any, resource: string, details: string, sensitivity?: any) => void;
}

export function MoeExecutiveDirectiveAuditsView({
  currentUser,
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
  onUploadExcelReturn,
  onLogAudit,
}: Props) {
  type DirectiveTab =
    | 'anti-fraud-suffix'
    | 'teacher-workload'
    | 'infrastructure-sanitation'
    | 'finance-uniform-sne'
    | 'safety-transition'
    | 'priority-checklist';

  const [activeTab, setActiveTab] = useState<DirectiveTab>('anti-fraud-suffix');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubCounty, setSelectedSubCounty] = useState('All');
  const [isExcelUploadModalOpen, setIsExcelUploadModalOpen] = useState(false);
  const [selectedUploadCategory, setSelectedUploadCategory] = useState('KEMIS Learner & Suffix Verification');
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedPrintableDossier, setSelectedPrintableDossier] = useState<{
    title: string;
    refNo: string;
    category: string;
    items: Record<string, string | number>[];
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSimulateExcelUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const count = Math.floor(15 + Math.random() * 20);
    onUploadExcelReturn(selectedUploadCategory, count);
    onLogAudit(
      'KEMIS_BATCH_SYNC',
      `MoE Executive Return Upload: ${selectedUploadCategory}`,
      `Batch ingested and validated ${count} records from authenticated Excel template.`,
      'Restricted'
    );
    setUploadFeedback(`Successfully processed ${count} records for ${selectedUploadCategory}. Verification hash generated.`);
    setTimeout(() => {
      setUploadFeedback(null);
      setIsExcelUploadModalOpen(false);
      showToast(`Uploaded and synchronized ${count} returns via Excel.`);
    }, 1500);
  };

  const handleDownloadExcelTemplate = (templateName: string) => {
    const dummyRows = [
      {
        'Institution Code': '20401823',
        'Campus Suffix': '20401823_JS',
        'Campus Name': 'Limuru Model Junior Secondary',
        'NEMIS UPI': 'B8219412',
        'Learner / Staff Full Name': 'Brian Omondi',
        'National ID / Birth Cert No': 'BC/2012/99042',
        'KNEC Assessment Index': '20401823001',
        'Verified Status': '100% Verified Mapped',
      },
    ];
    const columns = Object.keys(dummyRows[0]).map((k) => ({
      header: k,
      key: (item: any) => item[k] ?? '',
    }));
    exportToExcel(`MoE_Template_${templateName.replace(/\s+/g, '_')}`, dummyRows, columns);
    showToast(`Downloaded official MoE template for ${templateName}`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-xl shadow-xl border border-emerald-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Sovereign National Directive Masthead */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white p-6 rounded-2xl border border-amber-500/50 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-400 text-slate-950 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-950" />
                Executive Education Directive Compliance Console
              </span>
              <span className="text-xs text-amber-200 font-mono">
                Presidency & State Dept for Basic Education Mandate
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Anti-Fraud Sector Digitization, 100% Senior Transition & Facility Audits
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Enforcing Executive orders to eliminate ghost schools and inflated capitation rolls across Kiambu County. Monitor <strong>Primary (_PS) and Junior Secondary (_JS) suffix separation</strong>, subject-to-teacher workload matching, STEM lab inventories, sanitation ratios, and unconditional 100% Grade 10 transitions without fee barriers.
            </p>
          </div>

          {/* Action Hub: Print & Upload via Excel */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2.5 shrink-0">
            <button
              onClick={() => setIsExcelUploadModalOpen(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-colors border border-emerald-500/50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Upload via Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => {
                setSelectedPrintableDossier({
                  title: 'Executive Priority Checklist & Anti-Fraud Return',
                  refNo: 'MOE/EXEC/DIR/2026/001',
                  category: 'Comprehensive State Directive Return',
                  items: suffixAudits.map((s) => ({
                    'Campus Suffix': s.suffixCode,
                    'School Name': s.schoolName,
                    'Campus Type': s.campusType,
                    'Enrolled Headcount': s.enrolledLearners,
                    'KEMIS Verified': s.verifiedKemisHeadcount,
                    'Risk Status': s.ghostSchoolRiskIndex,
                    'Sub-County': s.subCounty,
                  })),
                });
              }}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-colors border border-slate-300"
            >
              <Printer className="w-4 h-4 text-emerald-800" />
              <span>Print Executive Dossier</span>
            </button>
          </div>
        </div>

        {/* Executive Directive Tabs Ribbon */}
        <div className="mt-6 flex flex-wrap gap-1.5 border-t border-slate-800 pt-4">
          {[
            {
              id: 'anti-fraud-suffix',
              label: '1. KEMIS Digitization & Suffix Audit (_PS / _JS)',
              count: suffixAudits.length + knecMappings.length,
              icon: Building2,
            },
            {
              id: 'teacher-workload',
              label: '2. Teacher Matching & TPAD Staffing Gaps',
              count: teacherWorkloads.length,
              icon: Users,
            },
            {
              id: 'infrastructure-sanitation',
              label: '3. STEM Labs, Devices & Sanitation Ratios',
              count: stemLabAudits.length + sanitationAudits.length,
              icon: Award,
            },
            {
              id: 'finance-uniform-sne',
              label: '4. Capitation Receipts, Uniforms & SNE Grants',
              count: capitationReconciliations.length + uniformReturns.length + sneReturns.length,
              icon: DollarSign,
            },
            {
              id: 'safety-transition',
              label: '5. Safety Compliance & 100% Transition Logs',
              count: safetyReturns.length + transitionReturns.length,
              icon: HeartPulse,
            },
            {
              id: 'priority-checklist',
              label: '6. Priority Action Checklist',
              count: priorityItems.length,
              icon: ShieldAlert,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as DirectiveTab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-amber-900 text-amber-200' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          TAB 1: KEMIS DIGITIZATION & SUFFIX AUDIT (_PS & _JS SPLIT)
          ========================================================================= */}
      {activeTab === 'anti-fraud-suffix' && (
        <div className="space-y-6">
          {/* Suffix Split Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-700" />
                  <span>Institutional Suffix Verification: Primary (_PS) & Junior Secondary (_JS) Split</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Separating campuses operating under shared registration certificates on the same compound to eliminate ghost capitation claims.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadExcelTemplate('Institutional_Suffix_Verification')}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Template</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="p-3">Campus Suffix Code</th>
                    <th className="p-3">Institution Name</th>
                    <th className="p-3">Campus Type</th>
                    <th className="p-3">Shared Cert No.</th>
                    <th className="p-3">Enrolled</th>
                    <th className="p-3">Verified KEMIS</th>
                    <th className="p-3">Ghost School Risk</th>
                    <th className="p-3">Separate Ledger</th>
                    <th className="p-3">Sub-County</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {suffixAudits.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-emerald-800">
                        {item.suffixCode}
                      </td>
                      <td className="p-3 font-bold text-slate-900">{item.schoolName}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.campusType.includes('_JS') ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.campusType}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-500">{item.sharedRegistrationCertNo}</td>
                      <td className="p-3 font-mono tabular-nums font-semibold">{item.enrolledLearners}</td>
                      <td className="p-3 font-mono tabular-nums text-emerald-700 font-bold">{item.verifiedKemisHeadcount}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.ghostSchoolRiskIndex === 'Verified Clean Operational'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800 animate-pulse'
                        }`}>
                          {item.ghostSchoolRiskIndex}
                        </span>
                      </td>
                      <td className="p-3">
                        {item.separateDigitalLedgerMaintained ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Compliant
                          </span>
                        ) : (
                          <span className="text-rose-600 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Deficit
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600">{item.subCounty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* KNEC Assessment Identifier Mapping */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-700" />
                  <span>KNEC Assessment Identifier Mapping & Real-Time UPI Verification</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Direct mapping of learners' UPI to KNEC Assessment Index Numbers (KPSEA / KJSEA) and Birth Certificate Entry Numbers.
                </p>
              </div>

              <button
                onClick={() => handleDownloadExcelTemplate('KNEC_Assessment_Identifier_Mapping')}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Template</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="p-3">Learner Name</th>
                    <th className="p-3">NEMIS UPI</th>
                    <th className="p-3">Birth Cert Entry No</th>
                    <th className="p-3">Grade & Campus</th>
                    <th className="p-3">KNEC Index No</th>
                    <th className="p-3">Exam Type</th>
                    <th className="p-3">Mapping Status</th>
                    <th className="p-3">Capitation Valid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {knecMappings.map((km) => (
                    <tr key={km.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{km.studentName}</td>
                      <td className="p-3 font-mono font-bold text-emerald-800">{km.nemisUpi}</td>
                      <td className="p-3 font-mono text-slate-600">{km.birthCertificateEntryNo}</td>
                      <td className="p-3">
                        <span className="font-semibold">{km.grade}</span> · <span className="text-[11px] text-slate-500">{km.campusSuffix.split(' ')[0]}</span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-800">{km.knecAssessmentIndexNo}</td>
                      <td className="p-3 text-slate-700">{km.assessmentExamType}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          km.mappingStatus === '100% Verified Mapped'
                            ? 'bg-emerald-100 text-emerald-800'
                            : km.mappingStatus === 'Unmapped Index Number'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {km.mappingStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        {km.capitationEligibility ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                          </span>
                        ) : (
                          <span className="text-rose-600 font-bold flex items-center gap-1">
                            <X className="w-3.5 h-3.5" /> Withheld
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
          TAB 2: TEACHER PERFORMANCE & WORKLOAD (TPAD INTEGRATION)
          ========================================================================= */}
      {activeTab === 'teacher-workload' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-2">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                <span>Teacher Performance & Workload Returns: Subject-to-Teacher Matching</span>
              </h3>
              <p className="text-xs text-slate-500">
                Auditing actual teacher utilization rates (Benchmark: 27 lessons/wk) and identifying acute STEM and practical pathway deficits.
              </p>
            </div>

            <button
              onClick={() => handleDownloadExcelTemplate('Teacher_Workload_TPAD_Matching')}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-bold">
                  <th className="p-3">Teacher Name</th>
                  <th className="p-3">TSC Number</th>
                  <th className="p-3">Campus</th>
                  <th className="p-3">Primary & Secondary Subjects</th>
                  <th className="p-3">Lessons/Wk</th>
                  <th className="p-3">Utilization Status</th>
                  <th className="p-3">Staffing Deficit Area</th>
                  <th className="p-3">TPAD Score</th>
                  <th className="p-3">Sub-County</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {teacherWorkloads.map((tw) => (
                  <tr key={tw.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{tw.teacherName}</td>
                    <td className="p-3 font-mono font-bold text-emerald-800">{tw.tscNumber}</td>
                    <td className="p-3 text-slate-600">{tw.campusSuffix.split(' ')[0]}</td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-900">{tw.primarySubject}</span>
                      <span className="text-[11px] text-slate-500 block">Sec: {tw.secondarySubject}</span>
                    </td>
                    <td className="p-3 font-mono font-bold tabular-nums text-slate-900">
                      {tw.teachingLoadLessonsPerWeek} Lessons
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tw.utilizationStatus.includes('Optimal')
                          ? 'bg-emerald-100 text-emerald-800'
                          : tw.utilizationStatus.includes('Overloaded')
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {tw.utilizationStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      {tw.staffingDeficitArea === 'None (Adequate)' ? (
                        <span className="text-emerald-700 font-medium">Adequate Staffing</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                          {tw.staffingDeficitArea}
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-700">{tw.tpadScore}%</td>
                    <td className="p-3 text-slate-600">{tw.subCounty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: STEM LABS, SPECIALIZED FACILITIES & SANITATION RATIOS
          ========================================================================= */}
      {activeTab === 'infrastructure-sanitation' && (
        <div className="space-y-6">
          {/* STEM Lab Audits */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-700" />
                  <span>STEM Lab Equipment, Reagents & Digital Connectivity Audits</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Verified inventories of functional lab microscopes, chemical certifications, power grid connectivity, and TVET workshops.
                </p>
              </div>

              <button
                onClick={() => handleDownloadExcelTemplate('STEM_Lab_Equipment_Audit')}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Template</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="p-3">School Name</th>
                    <th className="p-3">Lab Status</th>
                    <th className="p-3">Microscopes (Func/Def)</th>
                    <th className="p-3">Chemical Reagents</th>
                    <th className="p-3">Digital Devices</th>
                    <th className="p-3">Power Status</th>
                    <th className="p-3">Internet</th>
                    <th className="p-3">TVET Pre-Tech</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {stemLabAudits.map((sl) => (
                    <tr key={sl.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <strong className="text-slate-900 block">{sl.schoolName}</strong>
                        <span className="font-mono text-[10px] text-slate-400">Center: {sl.centerCode} · {sl.subCounty}</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sl.integratedScienceLabStatus === 'Fully Equipped & Functional'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {sl.integratedScienceLabStatus}
                        </span>
                      </td>
                      <td className="p-3 font-mono">
                        <span className="text-emerald-700 font-bold">{sl.functionalMicroscopes} Func</span>
                        <span className="text-slate-400"> / </span>
                        <span className="text-rose-600 font-bold">{sl.defectiveMicroscopes} Def</span>
                      </td>
                      <td className="p-3 text-[11px] text-slate-700 font-medium">
                        {sl.chemicalReagentsCertStatus}
                      </td>
                      <td className="p-3 font-mono">
                        <span className="font-bold text-slate-900">{sl.functionalTabletsLaptops} Devices</span>
                        <span className="text-[10px] text-slate-500 block">{sl.learnerToDeviceRatio}</span>
                      </td>
                      <td className="p-3 text-[11px] font-medium text-slate-800">{sl.powerGridStatus}</td>
                      <td className="p-3 text-[11px] text-slate-700">{sl.connectivityType}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800">
                          {sl.tvetPreTechWorkshopStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sanitation & Overcrowding Ratios */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-emerald-700" />
                <span>Sanitation & Overcrowding Ratios: Public Health Compliance</span>
              </h3>
              <p className="text-xs text-slate-500">
                Monitoring Learner-to-Toilet Ratios (Standards: Boys 1:30, Girls 1:25) and Learner-to-Classroom Ratios (Standard: 1:45) for disaster prevention.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="p-3">School Name</th>
                    <th className="p-3">Campus</th>
                    <th className="p-3">Boy-to-Toilet (MoE 1:30)</th>
                    <th className="p-3">Girl-to-Toilet (MoE 1:25)</th>
                    <th className="p-3">Learner-to-Classroom (MoE 1:45)</th>
                    <th className="p-3">Handwashing Points</th>
                    <th className="p-3">Compliance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {sanitationAudits.map((sn) => (
                    <tr key={sn.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{sn.schoolName}</td>
                      <td className="p-3 text-slate-600">{sn.campusSuffix.split(' ')[0]}</td>
                      <td className="p-3 font-mono font-bold text-slate-800">{sn.boyToToiletRatio}</td>
                      <td className="p-3 font-mono font-bold text-slate-800">{sn.girlToToiletRatio}</td>
                      <td className="p-3 font-mono font-bold text-slate-800">{sn.learnerToClassroomRatio}</td>
                      <td className="p-3 font-mono font-bold text-emerald-700">{sn.handwashingPointsServiced} Serviced</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sn.sanitationCompliance === 'Fully Compliant'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {sn.sanitationCompliance}
                        </span>
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
          TAB 4: CAPITATION RECONCILIATION, UNIFORMS & SNE GRANTS
          ========================================================================= */}
      {activeTab === 'finance-uniform-sne' && (
        <div className="space-y-6">
          {/* Capitation Receipts & Bank Reconciliations */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-700" />
                  <span>Capitation Receipt Confirmations & SCDE Validated Bank Accounts</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Reconciliation of Treasury IFMIS disbursements against school official receipt uploads to prevent unrecorded debts and unauthorized bank re-routing.
                </p>
              </div>

              <button
                onClick={() => handleDownloadExcelTemplate('Capitation_Reconciliation_Bank_Return')}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Template</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="p-3">School & Campus</th>
                    <th className="p-3">Expected Grant</th>
                    <th className="p-3">Actual Received</th>
                    <th className="p-3">Shortfall Debt</th>
                    <th className="p-3">Receipt Voucher</th>
                    <th className="p-3">Validated Bank Account</th>
                    <th className="p-3">Votehead Breakdown</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {capitationReconciliations.map((cr) => (
                    <tr key={cr.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <strong className="text-slate-900 block">{cr.schoolName}</strong>
                        <span className="text-[11px] text-slate-500">{cr.campusSuffix}</span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-800">KES {cr.expectedFundingKes.toLocaleString()}</td>
                      <td className="p-3 font-mono font-bold text-emerald-700">KES {cr.actualDisbursedKes.toLocaleString()}</td>
                      <td className="p-3 font-mono font-bold text-rose-600">KES {cr.shortfallDebtCarriedKes.toLocaleString()}</td>
                      <td className="p-3">
                        <span className="font-mono font-bold text-slate-900 block">{cr.officialReceiptVoucherRef}</span>
                        <span className="text-[10px] text-emerald-700 flex items-center gap-1">
                          <Check className="w-3 h-3" /> {cr.receiptUploadStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-slate-900 font-semibold block">{cr.scdeVerifiedBank}</span>
                        <span className="font-mono text-emerald-800 text-[11px]">{cr.bankAccountMasked} (SCDE Locked)</span>
                      </td>
                      <td className="p-3 text-[11px] space-y-0.5">
                        <div>Tuition: <strong className="font-mono">KES {cr.tuitionVoteheadKes.toLocaleString()}</strong></div>
                        <div>Operations: <strong className="font-mono">KES {cr.operationsVoteheadKes.toLocaleString()}</strong></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SNE EARC Allocations & Uniform Cost Controls Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* SNE EARC Returns */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-700" />
                  <span>Special Needs Education (SNE) EARC Assessment Audits</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Verified Educational Assessment and Resource Centre returns ensuring specialized capitation reaches eligible learners directly.
                </p>
              </div>

              <div className="p-4 space-y-3">
                {sneReturns.map((sn) => (
                  <div key={sn.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-slate-900 block">{sn.learnerName}</strong>
                      <span className="font-mono text-[11px] text-emerald-800">UPI: {sn.nemisUpi}</span> · <span className="text-slate-500">{sn.disabilityCategory}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">EARC Cert: {sn.earcReportNumber} ({sn.assessmentOfficer})</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-emerald-800 text-xs block">
                        + KES {sn.approvedSNEGrantPerAnnumKes.toLocaleString()}/yr
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {sn.verificationStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Uniform Cost Disclosures */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-700" />
                  <span>Uniform Cost Disclosures & Anti-Commercialization Returns</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Curbing school-level commercialization by auditing total uniform package costs against the Ministry price ceiling (KES 3,500).
                </p>
              </div>

              <div className="p-4 space-y-3">
                {uniformReturns.map((ur) => (
                  <div key={ur.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900">{ur.schoolName}</strong>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ur.commercializationStatus === 'Compliant with Price Cap'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {ur.commercializationStatus}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Compulsory Items: {ur.compulsoryItemsList.join(', ')}
                    </div>
                    <div className="flex justify-between items-center pt-1 font-mono text-[11px]">
                      <span>Package Total: <strong className="text-slate-900">KES {ur.schoolPackageTotalCostKes.toLocaleString()}</strong></span>
                      <span className="text-slate-500">Ministry Guideline Cap: KES {ur.ministryCeilingGuidelineKes.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: SAFETY COMPLIANCE & 100% TRANSITION TRACKING
          ========================================================================= */}
      {activeTab === 'safety-transition' && (
        <div className="space-y-6">
          {/* Senior School 100% Transition Tracking */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-700" />
                  <span>Unconditional Senior Secondary (Grade 10) & 100% Transition Tracking Log</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Enforcing the Executive directive guaranteeing admission without fee balances or uniform barriers, and active dropout tracing.
                </p>
              </div>

              <button
                onClick={() => handleDownloadExcelTemplate('100_Percent_Transition_Non_Reporting_Log')}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Template</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="p-3">Learner Name</th>
                    <th className="p-3">NEMIS UPI</th>
                    <th className="p-3">Junior School Origin</th>
                    <th className="p-3">Assigned Senior Secondary</th>
                    <th className="p-3">Admission Status</th>
                    <th className="p-3">Fee Waived</th>
                    <th className="p-3">Sub-County Officer Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {transitionReturns.map((tr) => (
                    <tr key={tr.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{tr.learnerName}</td>
                      <td className="p-3 font-mono font-bold text-emerald-800">{tr.nemisUpi}</td>
                      <td className="p-3 text-slate-700">{tr.juniorSchoolOrigin}</td>
                      <td className="p-3 font-semibold text-slate-900">{tr.seniorSchoolAssigned}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tr.admissionStatus.includes('Unconditionally')
                            ? 'bg-emerald-100 text-emerald-800'
                            : tr.admissionStatus.includes('Active Non-Reporting')
                            ? 'bg-rose-100 text-rose-800 animate-pulse'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {tr.admissionStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        {tr.feeLeviesWaived ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Fee Waived
                          </span>
                        ) : (
                          <span className="text-slate-500">Normal</span>
                        )}
                      </td>
                      <td className="p-3 text-[11px] text-slate-600 max-w-xs">{tr.subCountyOfficerAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Comprehensive Safety Audits */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-600" />
                <span>Fire, Structural Safety Compliance & Psychosocial Bullying Monitoring</span>
              </h3>
              <p className="text-xs text-slate-500">
                Auditing outward-opening dormitory door mechanisms, serviced extinguisher dates, and child protection logs.
              </p>
            </div>

            <div className="p-4 space-y-3">
              {safetyReturns.map((sr) => (
                <div key={sr.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <div>
                      <strong className="text-slate-900 text-sm">{sr.schoolName}</strong>
                      <span className="text-slate-500 text-[11px] block">
                        Fire Cert: <strong className="font-mono text-emerald-800">{sr.fireSafetyCertNumber}</strong> · Sub-County: {sr.subCounty}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-slate-900 text-white font-mono text-[11px]">
                      Fire Marshal Sign-Off: {sr.countyFireMarshalSignOffDate}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <span className="text-slate-500 block">Fire Extinguishers:</span>
                      <strong className="text-slate-900 font-mono">{sr.fireExtinguishersCount} Serviced (Valid)</strong>
                    </div>
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <span className="text-slate-500 block">Dormitory Doors:</span>
                      <strong className="text-emerald-700 font-semibold">{sr.dormitoryDoorMechanism}</strong>
                    </div>
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <span className="text-slate-500 block">Perimeter Security:</span>
                      <strong className="text-slate-800">{sr.perimeterMasonryFenceStatus}</strong>
                    </div>
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <span className="text-slate-500 block">Bullying / Psychosocial:</span>
                      <strong className="text-emerald-700">{sr.psychosocialIncidentsLoggedCount} Logged Interventions</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: EXECUTIVE PRIORITY ACTION CHECKLIST
          ========================================================================= */}
      {activeTab === 'priority-checklist' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <span>National Executive Priority Action Checklist & Target Recipients</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Statutory deadlines and targeted recipients across data verification, infrastructure capacity, financial debt audits, and learner welfare.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {priorityItems.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-xl border border-slate-200 bg-slate-50/80 hover:border-amber-400 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-200 text-slate-800 font-mono">
                    {item.priorityArea}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    {item.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{item.essentialReportReturn}</h4>
                  <div className="text-xs text-slate-600 pt-1">
                    Target Statutory Recipient: <strong className="text-emerald-900">{item.targetRecipient}</strong>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-white border border-slate-200 text-xs flex items-center justify-between font-mono text-slate-700">
                  <span>Enforcement Notice:</span>
                  <strong className="text-amber-800">{item.dueNotice}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EXCEL BATCH TEMPLATE & RETURN UPLOAD
          ========================================================================= */}
      {isExcelUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white px-6 py-4 flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-300 font-bold">
                MoE Excel Batch Ingestion Gateway
              </span>
              <button
                onClick={() => setIsExcelUploadModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSimulateExcelUpload} className="p-6 space-y-4 text-xs text-slate-800">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Upload MoE Statutory Return via Excel (.xlsx)
                </h3>
                <p className="text-slate-500 text-[11px]">
                  Select the statutory return category and ingest verified institutional spreadsheets with cryptographic validation.
                </p>
              </div>

              {uploadFeedback && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{uploadFeedback}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Return Category:</label>
                  <select
                    value={selectedUploadCategory}
                    onChange={(e) => setSelectedUploadCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="KEMIS Learner & Suffix Verification">1. KEMIS Learner & Suffix Verification (_PS / _JS)</option>
                    <option value="Teacher Subject Matching & TPAD Workload">2. Teacher Subject Matching & TPAD Workload</option>
                    <option value="STEM Lab Equipment & Reagent Audit">3. STEM Lab Equipment & Specialized Reagents</option>
                    <option value="Capitation Receipts & Bank Reconciliation">4. Capitation Receipts & Bank Account Reconciliation</option>
                    <option value="SNE EARC Assessment Returns">5. Special Needs Education (EARC) Returns</option>
                    <option value="100% Transition & Non-Reporting Log">6. 100% Senior Secondary Transition & Non-Reporting Log</option>
                  </select>
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center space-y-2 hover:bg-slate-50 transition-colors cursor-pointer">
                  <FileSpreadsheet className="w-8 h-8 text-emerald-700 mx-auto" />
                  <div className="font-semibold text-slate-800">Select or Drag Excel Spreadsheet Here</div>
                  <div className="text-[11px] text-slate-400">Supported formats: .xlsx, .xls, .csv (Max 15MB)</div>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    id="excel-file-upload"
                  />
                  <label
                    htmlFor="excel-file-upload"
                    className="inline-block px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-bold cursor-pointer text-xs mt-2"
                  >
                    Browse Files
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => handleDownloadExcelTemplate(selectedUploadCategory)}
                  className="text-emerald-700 hover:underline font-bold text-xs flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Blank Template</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsExcelUploadModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold shadow-md flex items-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Process Ingestion</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          PRINTABLE EXECUTIVE DOSSIER MODAL (PRINT READY VIA WINDOW.PRINT)
          ========================================================================= */}
      {selectedPrintableDossier && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white px-6 py-4 flex items-center justify-between no-print">
              <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-widest">
                Print Preview · Republic of Kenya Official Return
              </span>
              <button
                onClick={() => setSelectedPrintableDossier(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6 text-slate-900" id="printable-area">
              {/* Sovereign Masthead */}
              <div className="text-center space-y-1 border-b-2 border-slate-900 pb-4">
                <div className="w-14 h-14 mx-auto rounded-xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center font-bold text-2xl mb-1">
                  🇰🇪
                </div>
                <h2 className="text-lg font-black tracking-tight uppercase text-slate-950">
                  REPUBLIC OF KENYA · MINISTRY OF EDUCATION
                </h2>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  State Department for Basic Education · Kiambu County Directorate
                </h3>
                <h4 className="text-sm font-black text-slate-900 pt-1">
                  OFFICIAL EXECUTIVE AUDIT RETURN: {selectedPrintableDossier.title.toUpperCase()}
                </h4>
              </div>

              {/* Meta bar */}
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono">
                <div>Ref Number: <strong>{selectedPrintableDossier.refNo}</strong></div>
                <div>Category: <strong>{selectedPrintableDossier.category}</strong></div>
                <div>Date: <strong>{new Date().toLocaleDateString('en-GB')}</strong></div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                      {Object.keys(selectedPrintableDossier.items[0] || {}).map((header) => (
                        <th key={header} className="p-2.5 border border-slate-200">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPrintableDossier.items.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-200">
                        {Object.values(row).map((val, cellIdx) => (
                          <td key={cellIdx} className="p-2 border border-slate-200 font-medium">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Digital Seal & Signatures */}
              <div className="pt-6 border-t-2 border-dashed border-slate-300 flex justify-between items-center text-xs">
                <div>
                  <span className="block text-slate-500 text-[11px]">Certified Correct By:</span>
                  <strong className="text-slate-900 block font-bold">{currentUser.name}</strong>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Digital PKI Cert Fingerprint: SHA256:7B:9A:88:E1:90:3D:FA:44:88:12:9C:FE
                  </span>
                </div>

                <div className="border-2 border-slate-900 text-slate-900 font-black px-4 py-2 rounded uppercase tracking-wider text-xs text-center">
                  MINISTRY OF EDUCATION<br />
                  <span className="text-[10px] font-normal font-mono">STATE AUDIT VERIFIED</span>
                </div>
              </div>
            </div>

            {/* Print Buttons */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-between items-center no-print">
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>
              <button
                onClick={() => setSelectedPrintableDossier(null)}
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
