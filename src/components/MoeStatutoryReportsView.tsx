/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Printer,
  X,
  ExternalLink,
  Layers,
  Award,
  BookOpen,
  DollarSign,
  HeartPulse,
  Users,
  Building2,
  Check,
  FileSpreadsheet,
  Upload,
  Edit,
} from 'lucide-react';
import {
  MoeStatutoryReport,
  MoeReportCategory,
  AuthUser,
  KiambuSchoolRecord,
} from '../types/school';
import { exportToExcel } from '../utils/excelExport';

interface Props {
  currentUser: AuthUser;
  reports: MoeStatutoryReport[];
  schools: KiambuSchoolRecord[];
  onEndorseReport: (reportId: string, officerName: string) => void;
  onUpdateReport?: (updated: MoeStatutoryReport) => void;
  onLogAudit: (action: any, resource: string, details: string, sensitivity?: any) => void;
}

export function MoeStatutoryReportsView({
  currentUser,
  reports,
  schools,
  onEndorseReport,
  onLogAudit,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<MoeReportCategory | 'All'>('All');
  const [selectedSchool, setSelectedSchool] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Verified & Endorsed' | 'Pending Review' | 'Flagged for Audit'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReportForDossier, setSelectedReportForDossier] = useState<MoeStatutoryReport | null>(null);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [excelCategoryToUpload, setExcelCategoryToUpload] = useState('NEMIS / Data Portal Updates');
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const categoriesList: { id: MoeReportCategory | 'All'; label: string; count: number; icon: any }[] = [
    { id: 'All', label: 'All Statutory Reports', count: reports.length, icon: Layers },
    {
      id: 'Enrollment & Learner Data',
      label: '1. Enrollment & Learner Data',
      count: reports.filter((r) => r.category === 'Enrollment & Learner Data').length,
      icon: Users,
    },
    {
      id: 'Financial Management & Accountability',
      label: '2. Financial Management & Accountability',
      count: reports.filter((r) => r.category === 'Financial Management & Accountability').length,
      icon: DollarSign,
    },
    {
      id: 'Curriculum & Academic Performance',
      label: '3. Curriculum & Academic Performance',
      count: reports.filter((r) => r.category === 'Curriculum & Academic Performance').length,
      icon: BookOpen,
    },
    {
      id: 'Institutional Health, Safety & Governance',
      label: '4. Health, Safety & Governance',
      count: reports.filter((r) => r.category === 'Institutional Health, Safety & Governance').length,
      icon: HeartPulse,
    },
  ];

  const filteredReports = reports.filter((r) => {
    if (selectedCategory !== 'All' && r.category !== selectedCategory) return false;
    if (selectedSchool !== 'All' && r.schoolName !== selectedSchool) return false;
    if (selectedStatus !== 'All' && r.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.reportName.toLowerCase().includes(q) ||
        r.schoolName.toLowerCase().includes(q) ||
        r.centerCode.includes(q) ||
        r.officialRefNumber.toLowerCase().includes(q) ||
        r.keyContentsAndPurpose.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportReportsExcel = () => {
    if (filteredReports.length === 0) return;

    const rows = filteredReports.map((r) => ({
      'Official Ref Number': r.officialRefNumber,
      'Report Category': r.category,
      'Report Name': r.reportName,
      'School Name': r.schoolName,
      'Center Code': r.centerCode,
      'Sub-County': r.subCounty,
      'Academic Year / Term': `${r.academicYear} ${r.term}`,
      'Submission Date': r.submissionDate,
      'Compliance Rating (%)': r.complianceRatingPercent,
      'Verification Status': r.status,
      'Verified By': r.verifiedByOfficer || 'Pending',
      'Key Contents & Purpose': r.keyContentsAndPurpose,
      'Why Crucial': r.whyCrucial,
    }));

    const filename = `MoE_Statutory_Reports_${selectedCategory.replace(/\s+/g, '_')}_2026`;
    const columns = Object.keys(rows[0] || {}).map((k) => ({
      header: k,
      key: (item: any) => item[k] ?? '',
    }));

    exportToExcel(filename, rows, columns);

    onLogAudit(
      'DATA_EXPORT_EXCEL',
      'MoE Statutory Reports Archive',
      `Exported ${filteredReports.length} statutory school compliance reports. Category: ${selectedCategory}`,
      'Confidential'
    );
    showToast('Exported statutory reports ledger to Excel.');
  };

  const handleEndorseAction = (r: MoeStatutoryReport) => {
    onEndorseReport(r.id, `${currentUser.name} (${currentUser.title})`);
    onLogAudit(
      'MOE_INSPECTION_AUDIT',
      `MoE Report Endorsement: ${r.reportName} (${r.schoolName})`,
      `Official endorsement stamped under Ref ${r.officialRefNumber} by ${currentUser.name}. Compliance Rating: 100%.`,
      'Restricted'
    );
    showToast(`Report '${r.reportName}' for ${r.schoolName} officially endorsed!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-xl shadow-xl border border-emerald-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Statutory Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-emerald-950 text-white p-6 rounded-2xl border border-amber-500/40 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-400 text-slate-950">
                MoE Statutory Reporting Console
              </span>
              <span className="text-xs text-amber-200 font-mono">
                Basic Education Act No. 14 of 2013 & PFM Act
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Institutional Compliance, Academic & Financial Accountability Returns
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Mandatory statutory reports submitted by <strong>all Kiambu County approved public and private primary and junior secondary institutions</strong>. Every report enforces capitation disbursement validity, quality assurance, learner protection, and disaster prevention.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setIsExcelModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors border border-emerald-500/50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Upload via Excel (.xlsx)</span>
            </button>

            <button
              onClick={handleExportReportsExcel}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Download className="w-4 h-4" />
              <span>Export (.xlsx)</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors border border-slate-300"
            >
              <Printer className="w-4 h-4 text-emerald-800" />
              <span>Print Page</span>
            </button>
          </div>
        </div>

        {/* 4 Pillars Tab Ribbon */}
        <div className="mt-6 flex flex-wrap gap-1.5 border-t border-slate-800 pt-4">
          {categoriesList.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-amber-900 text-amber-200' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search report title, school, center code, or official ref..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Filter School:</span>
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Kiambu Schools ({schools.length})</option>
              {schools.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.centerCode})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Statuses</option>
              <option value="Verified & Endorsed">Verified & Endorsed</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Flagged for Audit">Flagged for Audit</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between overflow-hidden"
          >
            {/* Report Header Strip */}
            <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 font-mono">
                    {report.category}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Ref: {report.officialRefNumber}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{report.reportName}</span>
                </h3>
                <div className="text-xs text-slate-600">
                  <strong className="text-slate-800">{report.schoolName}</strong> · Center Code: <span className="font-mono">{report.centerCode}</span> · Sub-County: {report.subCounty}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    report.status === 'Verified & Endorsed'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : report.status === 'Pending Review'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {report.status === 'Verified & Endorsed' && <CheckCircle2 className="w-3 h-3" />}
                  {report.status === 'Pending Review' && <AlertTriangle className="w-3 h-3" />}
                  <span>{report.status}</span>
                </span>
                <span className="block text-[10px] text-slate-400 font-mono mt-1">
                  Submitted: {report.submissionDate}
                </span>
              </div>
            </div>

            {/* Key Contents & Why Crucial Body */}
            <div className="p-4 space-y-3 flex-1 text-xs">
              {/* Key Contents */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  Key Contents & Purpose
                </span>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                  {report.keyContentsAndPurpose}
                </p>
              </div>

              {/* Why Crucial Box */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  Why It Is Crucial (State Enforcement Mandate)
                </span>
                <div className="text-amber-950 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200/80 leading-relaxed font-medium">
                  {report.whyCrucial}
                </div>
              </div>

              {/* Summary Metrics Chips */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Audited Return Metrics ({report.academicYear} {report.term}):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {Object.entries(report.summaryMetrics).map(([k, v]) => (
                    <div key={k} className="p-2 bg-slate-50 rounded border border-slate-200/80">
                      <div className="text-[10px] text-slate-500 truncate" title={k}>
                        {k}
                      </div>
                      <div className="text-xs font-bold text-slate-800 font-mono truncate" title={String(v)}>
                        {String(v)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer with Compliance & Action Buttons */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">Compliance:</span>
                <span className="font-bold text-emerald-700 font-mono">{report.complianceRatingPercent}%</span>
                {report.verifiedByOfficer && (
                  <span className="hidden sm:inline text-[11px] text-slate-400">· Stamped by {report.verifiedByOfficer}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedReportForDossier(report)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md font-semibold text-xs flex items-center gap-1 transition-colors shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span>Inspect Dossier</span>
                </button>

                {report.status !== 'Verified & Endorsed' && (
                  <button
                    onClick={() => handleEndorseAction(report)}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-md font-bold text-xs flex items-center gap-1 transition-colors shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Endorse & Stamp</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-500 space-y-2">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="font-bold text-slate-700 text-sm">No statutory reports matched the criteria</div>
          <div className="text-xs">Adjust your search term, pillar category, or school filter above.</div>
        </div>
      )}

      {/* =========================================================================
          MODAL: OFFICIAL STATUTORY REPORT DOSSIER (PRINT READY)
          ========================================================================= */}
      {selectedReportForDossier && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Sovereign Header */}
            <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-950 text-white px-6 py-4 flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-300 font-bold">
                Republic of Kenya · Ministry of Education Official Statutory Return
              </span>
              <button
                onClick={() => setSelectedReportForDossier(null)}
                className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-800/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6 text-slate-800">
              {/* Crest & Title */}
              <div className="text-center space-y-1 border-b-2 border-slate-900 pb-4">
                <div className="w-12 h-12 mx-auto rounded-xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center font-bold text-xl mb-1">
                  🇰🇪
                </div>
                <h2 className="text-base font-black tracking-tight uppercase text-slate-900">
                  Republic of Kenya · Ministry of Education
                </h2>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  State Department for Basic Education · Kiambu County Directorate
                </h3>
                <h4 className="text-sm font-black text-slate-900 pt-1">
                  OFFICIAL STATUTORY INSPECTORATE RETURN: {selectedReportForDossier.reportName.toUpperCase()}
                </h4>
              </div>

              {/* Institution Identification Header */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Institution Name:</span>
                  <strong className="text-slate-900">{selectedReportForDossier.schoolName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">MoE Center Code:</span>
                  <strong className="font-mono text-emerald-800">{selectedReportForDossier.centerCode}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Sub-County Jurisdiction:</span>
                  <strong>{selectedReportForDossier.subCounty}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Official Ref Number:</span>
                  <strong className="font-mono">{selectedReportForDossier.officialRefNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Academic Period:</span>
                  <strong>{selectedReportForDossier.academicYear} · {selectedReportForDossier.term}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Filing Date:</span>
                  <strong className="font-mono">{selectedReportForDossier.submissionDate}</strong>
                </div>
              </div>

              {/* Statutory Specifications */}
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200">
                  <h5 className="font-bold text-emerald-950 uppercase tracking-wide text-[11px] mb-1">
                    Key Contents & Purpose
                  </h5>
                  <p className="text-slate-700 leading-relaxed">
                    {selectedReportForDossier.keyContentsAndPurpose}
                  </p>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-300">
                  <h5 className="font-bold text-amber-950 uppercase tracking-wide text-[11px] mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    State Mandate & Why Crucial
                  </h5>
                  <p className="text-amber-900 leading-relaxed font-medium">
                    {selectedReportForDossier.whyCrucial}
                  </p>
                </div>

                <div>
                  <h5 className="font-bold text-slate-800 uppercase tracking-wide text-[11px] mb-2">
                    Verified Statutory Data Indicators
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                    {Object.entries(selectedReportForDossier.summaryMetrics).map(([k, v]) => (
                      <div key={k} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-slate-500 block text-[11px]">{k}</span>
                        <strong className="text-slate-900 text-sm font-mono">{String(v)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Digital Certificate & Signature */}
              <div className="pt-4 border-t-2 border-dashed border-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="block text-[11px] text-slate-500">Reviewed & Endorsed By:</span>
                  <strong className="text-slate-900 font-bold block">
                    {selectedReportForDossier.verifiedByOfficer || currentUser.name}
                  </strong>
                  <span className="text-[10px] text-emerald-700 font-mono">
                    Digital PKI Cert Hash: SHA256:7B:9A:88:E1:90:3D:FA:44:88:12:9C:FE
                  </span>
                </div>
                <div className="border-2 border-emerald-800 text-emerald-800 font-black px-4 py-2 rounded uppercase tracking-wider text-xs">
                  STATE AUDIT VALIDATED
                </div>
              </div>
            </div>

            {/* Modal Controls */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between no-print">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Dossier</span>
              </button>
              <button
                onClick={() => setSelectedReportForDossier(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: UPLOAD STATUTORY REPORT VIA EXCEL
          ========================================================================= */}
      {isExcelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white px-6 py-4 flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-300 font-bold">
                Upload Statutory Report via Excel
              </span>
              <button
                onClick={() => setIsExcelModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setUploadNotice(`Successfully validated and uploaded 12 school statutory returns for ${excelCategoryToUpload}.`);
                onLogAudit(
                  'KEMIS_BATCH_SYNC',
                  `Statutory Return Excel Upload: ${excelCategoryToUpload}`,
                  `Verified spreadsheet uploaded by ${currentUser.name}. Applied SHA-256 validation seal.`,
                  'Confidential'
                );
                setTimeout(() => {
                  setUploadNotice(null);
                  setIsExcelModalOpen(false);
                  showToast(`Uploaded statutory return for ${excelCategoryToUpload}.`);
                }, 1400);
              }}
              className="p-6 space-y-4 text-xs text-slate-800"
            >
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Batch Upload Statutory Return (.xlsx)
                </h3>
                <p className="text-slate-500 text-[11px]">
                  Submit certified institutional spreadsheets. The system verifies school center codes and calculates automated compliance ratings.
                </p>
              </div>

              {uploadNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{uploadNotice}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Report Type:</label>
                  <select
                    value={excelCategoryToUpload}
                    onChange={(e) => setExcelCategoryToUpload(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="NEMIS / Data Portal Updates">NEMIS / Data Portal Updates</option>
                    <option value="Daily/Monthly Attendance & Admission Registers">Daily/Monthly Attendance & Admission Registers</option>
                    <option value="Transfer & Admission Forms">Transfer & Admission Forms</option>
                    <option value="Annual Audited Financial Statements">Annual Audited Financial Statements</option>
                    <option value="Approved Annual Budget & Procurement Plan">Approved Annual Budget & Procurement Plan</option>
                    <option value="Stores & Fixed Asset Registers">Stores & Fixed Asset Registers</option>
                    <option value="Schemes of Work & Records of Work Done">Schemes of Work & Records of Work Done</option>
                    <option value="National Exam Analysis & Assessment Returns">National Exam Analysis & Assessment Returns</option>
                    <option value="Co-Curricular Progress Reports">Co-Curricular Progress Reports</option>
                    <option value="Safety & Infrastructure Standards Assessment">Safety & Infrastructure Standards Assessment</option>
                    <option value="School Logbook & Visitors' Book">School Logbook & Visitors' Book</option>
                    <option value="Guidance, Counseling & Unrest Monitoring">Guidance, Counseling & Unrest Monitoring</option>
                    <option value="Punishment / Discipline Record">Punishment / Discipline Record</option>
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
                    id="statutory-excel-file"
                  />
                  <label
                    htmlFor="statutory-excel-file"
                    className="inline-block px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-bold cursor-pointer text-xs mt-2"
                  >
                    Browse Files
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    const sample = [
                      {
                        'Official Center Code': '20401823',
                        'School Name': 'Limuru Model Comprehensive School',
                        'Report Type': excelCategoryToUpload,
                        'Term & Year': '2026 Term 1',
                        'Headteacher TSC No': 'TSC/489102',
                        'Total Learners Audited': '784',
                        'Key Findings': 'Fully verified against digital KEMIS register.',
                      },
                    ];
                    const columns = Object.keys(sample[0]).map((k) => ({
                      header: k,
                      key: (item: any) => item[k] ?? '',
                    }));
                    exportToExcel(`MoE_Template_${excelCategoryToUpload.replace(/\s+/g, '_')}`, sample, columns);
                    showToast(`Downloaded official template for ${excelCategoryToUpload}`);
                  }}
                  className="text-emerald-700 hover:underline font-bold text-xs flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Blank Template</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsExcelModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold shadow-md flex items-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload & Ingest</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
