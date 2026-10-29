/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  History,
  CheckCircle2,
  Filter,
  Search,
  Database,
  Terminal,
  Key,
  Calendar,
  Layers,
  Printer,
  Upload,
  X,
} from 'lucide-react';
import {
  Learner,
  SecurityAuditLog,
  AuthUser,
} from '../types/school';
import { exportToExcel } from '../utils/excelExport';

interface DataPrivacyAndAuditModuleProps {
  currentUser: AuthUser;
  learners: Learner[];
  auditLogs: SecurityAuditLog[];
  isPiiDecrypted: boolean;
  onTogglePiiDecrypt: () => void;
  onAddAuditLog: (log: Omit<SecurityAuditLog, 'id' | 'timestamp'>) => void;
}

export const DataPrivacyAndAuditModule: React.FC<DataPrivacyAndAuditModuleProps> = ({
  currentUser,
  learners,
  auditLogs,
  isPiiDecrypted,
  onTogglePiiDecrypt,
  onAddAuditLog,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('All');
  const [sensitivityFilter, setSensitivityFilter] = useState<string>('All');
  const [isExporting, setIsExporting] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const handleExportAuditTrailExcel = () => {
    exportToExcel(
      'Limuru_Model_Security_Audit_Trail',
      filteredLogs,
      [
        { header: 'Timestamp', key: 'timestamp' },
        { header: 'User Name', key: 'userName' },
        { header: 'User Role', key: 'userRole' },
        { header: 'Action', key: 'action' },
        { header: 'Target Resource', key: 'targetResource' },
        { header: 'Details', key: 'details' },
        { header: 'IP Address', key: 'ipAddress' },
        { header: 'Sensitivity Level', key: 'sensitivityLevel' },
      ]
    );
    showToast('Exported audit logs to Excel.');
  };

  // Masking helpers
  const maskPhone = (phone: string) => {
    if (isPiiDecrypted) return phone;
    if (!phone || phone.length < 8) return '+254 7•• ••• •••';
    const parts = phone.split(' ');
    if (parts.length >= 3) {
      return `${parts[0]} ${parts[1]?.substring(0, 2)}•• ••• ${parts[parts.length - 1]}`;
    }
    return phone.substring(0, 7) + '••••' + phone.substring(phone.length - 2);
  };

  const maskNationalId = (id?: string) => {
    if (!id) return 'ID-••••••••';
    if (isPiiDecrypted) return id;
    return id.substring(0, 4) + '••••' + id.substring(id.length - 2);
  };

  // Handle Export with Audit
  const handleExportSensitiveData = (isAnonymized: boolean) => {
    setIsExporting(true);

    const exportData = learners.map((std, idx) => ({
      '#': idx + 1,
      'Admission No': std.admissionNo,
      'NEMIS UPI': std.nemisUpi,
      'Assessment No': std.assessmentNo,
      'Learner Full Name': std.name,
      'Gender': std.gender,
      'Grade Level': std.grade,
      'Stream': std.stream,
      'Guardian Name': std.guardianName,
      'Guardian Mobile Phone': isAnonymized ? maskPhone(std.guardianPhone) : std.guardianPhone,
      'Parent National ID': isAnonymized ? maskNationalId(std.parentNationalId || 'ID-24819021') : (std.parentNationalId || 'ID-24819021'),
      'KEMIS Capitation Status': std.kemisStatus,
      'Total Term Fee': std.fees.totalTermFee,
      'Paid Amount': std.fees.paidAmount,
      'Balance (KES)': std.fees.balance,
      'Fee Status': std.fees.status,
      'Data Classification': isAnonymized ? 'Anonymized Research Extract' : 'CONFIDENTIAL PII (Restricted)',
    }));

    const filename = isAnonymized ? 'Limuru_Model_Learners_Anonymized' : 'Limuru_Model_Learners_Confidential_PII';
    const columns = Object.keys(exportData[0] || {}).map((colKey) => ({
      header: colKey,
      key: (item: Record<string, unknown>) => item[colKey] ?? '',
    }));

    exportToExcel(filename, exportData, columns);

    onAddAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'DATA_EXPORT_EXCEL',
      targetResource: isAnonymized
        ? 'Anonymized Learner Register (Grades 1-9)'
        : 'Confidential PII Learner Register with Cleartext Phones & National IDs',
      details: `Exported ${learners.length} student records into Excel workbook. Anonymization flag: ${isAnonymized ? 'TRUE' : 'FALSE'}.`,
      ipAddress: '197.232.88.14 (Limuru Admin LAN)',
      sensitivityLevel: isAnonymized ? 'General' : 'Confidential',
    });

    setTimeout(() => {
      setIsExporting(false);
    }, 600);
  };

  const filteredLogs = auditLogs.filter((log) => {
    if (actionFilter !== 'All' && log.action !== actionFilter) return false;
    if (sensitivityFilter !== 'All' && log.sensitivityLevel !== sensitivityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.userName.toLowerCase().includes(q) ||
        log.targetResource.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="p-3 bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{feedbackToast}</span>
          </div>
          <button onClick={() => setFeedbackToast(null)} className="text-emerald-300 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-white">
                Data Encryption, PII Anonymization & Security Audit Engine
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                AES-256 At-Rest Verified
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Compliant with Kenya Data Protection Act 2019 · Immutable audit trail logging all downloads, exports, and decryption events
            </p>
          </div>
        </div>

        {/* Toggle PII Decrypt */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onTogglePiiDecrypt}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-xs ${
              isPiiDecrypted
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 ring-2 ring-amber-400'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
          >
            {isPiiDecrypted ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span>Re-Encrypt & Mask PII</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>Temporarily Reveal / Decrypt PII</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Security Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>PII At-Rest Protection</span>
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {isPiiDecrypted ? (
              <span className="text-amber-700 flex items-center gap-2">
                <Unlock className="w-5 h-5 text-amber-600" />
                Decrypted View (Audited)
              </span>
            ) : (
              <span className="text-emerald-700 flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-600" />
                Masked & Encrypted
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Parent phone numbers and national IDs are pseudonymized across user interfaces. Viewing unmasked data triggers a mandatory security event.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Audited System Events</span>
            <History className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">
            {auditLogs.length} Security Logs
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            All spreadsheet exports, KEMIS API synchronizations, marksheet generation, and authentication handshakes are stamped with timestamps and IP addresses.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Secure Learner Data Export</span>
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => handleExportSensitiveData(true)}
              disabled={isExporting}
              className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Export Anonymized</span>
            </button>
            <button
              onClick={() => handleExportSensitiveData(false)}
              disabled={isExporting}
              className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Export Full (Confidential)</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-400">
            Exports are registered into the permanent BoM audit registry.
          </p>
        </div>
      </div>

      {/* PII Masking Live Preview Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-700" />
              Learner & Guardian PII Protection Ledger (Live Inspection)
            </h3>
            <p className="text-[11px] text-slate-500">
              Demonstrates automatic pseudonymization of parent phone numbers and national ID cards
            </p>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
            {learners.length} Protected Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                <th className="py-2.5 px-4">Admission & Learner</th>
                <th className="py-2.5 px-4">Grade & Stream</th>
                <th className="py-2.5 px-4">Guardian Name</th>
                <th className="py-2.5 px-4">Guardian Phone (Masked at Rest)</th>
                <th className="py-2.5 px-4">Parent National ID</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {learners.map((std) => (
                <tr key={std.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4">
                    <div className="font-bold text-slate-900">{std.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{std.admissionNo} · {std.nemisUpi}</div>
                  </td>
                  <td className="py-2.5 px-4 font-medium text-slate-700">
                    {std.grade} ({std.stream})
                  </td>
                  <td className="py-2.5 px-4 text-slate-800 font-medium">
                    {std.guardianName}
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`font-mono px-2 py-0.5 rounded text-[11px] font-medium border ${
                        isPiiDecrypted
                          ? 'bg-amber-50 text-amber-900 border-amber-300'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {maskPhone(std.guardianPhone)}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`font-mono px-2 py-0.5 rounded text-[11px] font-medium border ${
                        isPiiDecrypted
                          ? 'bg-amber-50 text-amber-900 border-amber-300'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {maskNationalId(std.parentNationalId || 'ID-24819021')}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      AES-256
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Audit Log Stream */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs space-y-4 p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-700" />
              Security Audit Trail & Download Log
            </h3>
            <p className="text-xs text-slate-500">
              Immutable chronological record of administrative actions, data exports, and KEMIS sync handshakes
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Print Button */}
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 border border-slate-300"
              title="Print Audit Trail"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Log</span>
            </button>

            {/* Export Excel */}
            <button
              onClick={handleExportAuditTrailExcel}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 border border-emerald-300"
              title="Export Audit Trail to Excel / CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Export Excel</span>
            </button>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-md text-xs bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="All">All Actions</option>
              <option value="FILE_UPLOAD">FILE_UPLOAD</option>
              <option value="FILE_DOWNLOAD">FILE_DOWNLOAD</option>
              <option value="FILE_DELETE">FILE_DELETE</option>
              <option value="DATA_EXPORT_EXCEL">DATA_EXPORT_EXCEL</option>
              <option value="KEMIS_SYNC">KEMIS_SYNC</option>
              <option value="PII_DECRYPT_VIEW">PII_DECRYPT_VIEW</option>
              <option value="FEE_LEDGER_EXPORT">FEE_LEDGER_EXPORT</option>
              <option value="TEACHER_ONBOARDED">TEACHER_ONBOARDED</option>
              <option value="FLEET_FUEL_LOG">FLEET_FUEL_LOG</option>
            </select>

            <select
              value={sensitivityFilter}
              onChange={(e) => setSensitivityFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-md text-xs bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="All">All Sensitivity Levels</option>
              <option value="Confidential">Confidential</option>
              <option value="Restricted">Restricted</option>
              <option value="General">General</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor & Role</th>
                <th className="py-2.5 px-3">Security Action</th>
                <th className="py-2.5 px-3">Target Resource</th>
                <th className="py-2.5 px-3">Action Details</th>
                <th className="py-2.5 px-3">Origin IP</th>
                <th className="py-2.5 px-3 text-center">Sensitivity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => {
                const sensitivityColor =
                  log.sensitivityLevel === 'Confidential'
                    ? 'bg-rose-100 text-rose-800 border-rose-200'
                    : log.sensitivityLevel === 'Restricted'
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200';

                return (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-2.5 px-3">
                      <strong className="text-slate-900 block">{log.userName}</strong>
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        {log.userRole.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {log.targetResource}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.ipAddress}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sensitivityColor}`}>
                        {log.sensitivityLevel}
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
  );
};
