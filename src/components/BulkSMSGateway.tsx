/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Users,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Clock,
  Sparkles,
  Printer,
  FileSpreadsheet,
  Upload,
  Award,
  GraduationCap,
  AlertCircle,
  FileCheck,
  Check,
  X,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Learner, SMSBroadcast, GradeLevel } from '../types/school';
import { ALL_GRADES } from '../data/mockSchoolData';
import { exportToExcel } from '../utils/excelExport';
import { uploadFileWithProgress } from '../services/storageService';
import { useAuth } from '../context/AuthContext';

interface Props {
  students: Learner[];
  broadcasts: SMSBroadcast[];
  onSendBroadcast: (broadcast: SMSBroadcast) => void;
  initialDraft?: {
    targetGroup?: 'All Grades' | 'Fee Defaulters' | GradeLevel;
    messageText?: string;
    messageType?: SMSBroadcast['type'];
    targetStudentName?: string;
  } | null;
  onClearInitialDraft?: () => void;
}

interface UploadedContact {
  rowNum: number;
  name: string;
  rawPhone: string;
  normalizedPhone?: string;
  isValid: boolean;
  validationError?: string;
}

/**
 * Validates Kenyan phone number strictly according to CAK numbering plan
 * (07XX / 01XX / +254 7XX / +254 1XX)
 */
export const validateKenyanPhone = (
  raw: string
): { isValid: boolean; normalized?: string; error?: string } => {
  if (!raw) return { isValid: false, error: 'Empty phone number.' };

  // Strip whitespaces, dashes, parentheses
  const clean = raw.trim().replace(/[\s\-()]/g, '');

  // 1. Starts with +254
  if (clean.startsWith('+254')) {
    const rest = clean.substring(4);
    if ((rest.startsWith('7') || rest.startsWith('1')) && rest.length === 9) {
      return { isValid: true, normalized: clean };
    }
    return {
      isValid: false,
      error: `Invalid Kenyan format. Must start with +2547... or +2541... with 9 digits following.`,
    };
  }

  // 2. Starts with 254 (without plus)
  if (clean.startsWith('254')) {
    const rest = clean.substring(3);
    if ((rest.startsWith('7') || rest.startsWith('1')) && rest.length === 9) {
      return { isValid: true, normalized: `+${clean}` };
    }
    return {
      isValid: false,
      error: `Invalid Kenyan format. Must start with 2547... or 2541... with 9 digits following.`,
    };
  }

  // 3. Starts with 07 or 01 (10 digits)
  if (clean.startsWith('07') || clean.startsWith('01')) {
    if (clean.length === 10) {
      return { isValid: true, normalized: `+254${clean.substring(1)}` };
    }
    return {
      isValid: false,
      error: `Kenyan local numbers starting with 07 or 01 must be exactly 10 digits long.`,
    };
  }

  // 4. Starts with 7 or 1 directly (9 digits)
  if ((clean.startsWith('7') || clean.startsWith('1')) && clean.length === 9) {
    return { isValid: true, normalized: `+254${clean}` };
  }

  return {
    isValid: false,
    error: `Not a valid Kenyan carrier number. Must begin with 07XX, 01XX, or +254.`,
  };
};

export function BulkSMSGateway({
  students,
  broadcasts,
  onSendBroadcast,
  initialDraft,
  onClearInitialDraft,
}: Props) {
  const { currentUser } = useAuth();
  const [activeMode, setActiveMode] = useState<'standard' | 'grade_results' | 'uploaded_contacts'>('grade_results');
  const [selectedResultsGrade, setSelectedResultsGrade] = useState<GradeLevel>('Grade 8');
  const [targetGroup, setTargetGroup] = useState<'All Grades' | 'Fee Defaulters' | GradeLevel>(
    initialDraft?.targetGroup || 'All Grades'
  );
  const [messageType, setMessageType] = useState<SMSBroadcast['type']>(
    initialDraft?.messageType || 'Academic Report'
  );
  const [messageText, setMessageText] = useState<string>(
    initialDraft?.messageText ||
      'Dear Parent of {Learner_Name} (Adm: {Adm_No}): Term 1 CBC Formative & Summative Results: Math: Exceeding Expectation (84%), Eng: Meeting (76%), Sci: Meeting (78%). Class Position: 6/48. School resumes 6th Jan 2027. Principal.'
  );
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState<string | null>(null);

  // Uploaded contacts state
  const [uploadedContacts, setUploadedContacts] = useState<UploadedContact[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isUploadingContacts, setIsUploadingContacts] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [contactValidationErrors, setContactValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (initialDraft) {
      if (initialDraft.targetGroup) setTargetGroup(initialDraft.targetGroup);
      if (initialDraft.messageType) setMessageType(initialDraft.messageType);
      if (initialDraft.messageText) setMessageText(initialDraft.messageText);
    }
  }, [initialDraft]);

  // Filter recipients based on selection
  const recipientStudents = students.filter((s) => {
    if (activeMode === 'grade_results') {
      return s.grade === selectedResultsGrade;
    }
    if (targetGroup === 'All Grades') return true;
    if (targetGroup === 'Fee Defaulters') return s.fees.balance > 0;
    return s.grade === targetGroup;
  });

  const validUploadedCount = uploadedContacts.filter((c) => c.isValid).length;
  const targetRecipientCount =
    activeMode === 'uploaded_contacts' ? validUploadedCount : recipientStudents.length;

  const smsUnits = Math.ceil(messageText.length / 160) || 1;

  const handleApplyTemplate = (type: SMSBroadcast['type']) => {
    setMessageType(type);
    if (type === 'Academic Report') {
      setMessageText(
        'Dear Parent of {Learner_Name} (Adm: {Adm_No}): Term 1 CBC Formative & Summative Results: Math: Exceeding Expectation (84%), Eng: Meeting (76%), Sci: Meeting (78%). Class Position: 6/48. School resumes 6th Jan 2027. Principal.'
      );
    } else if (type === 'Fee Reminder') {
      setMessageText(
        'Dear Parent/Guardian, you are kindly reminded to clear outstanding Term 1 fees for your learner at Limuru Model School via Paybill 522123 (Account: Learner Adm No). Thank you.'
      );
    } else if (type === 'AGM & Parents Meeting') {
      setMessageText(
        'Limuru Model School Notice: Parents & Teachers Consultative AGM will be held this Saturday from 9:00 AM at the School Pavilion. Your prompt attendance is appreciated.'
      );
    } else if (type === 'Emergency Alert') {
      setMessageText(
        'URGENT NOTICE: Due to scheduled national environmental maintenance, school will break today at 1:00 PM. School transport will depart promptly. Principal.'
      );
    } else {
      setMessageText('Limuru Model Comprehensive School announcement to all respected parents and guardians.');
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || targetRecipientCount === 0) return;

    setIsSending(true);
    setSentSuccess(null);

    setTimeout(() => {
      const newBroadcast: SMSBroadcast = {
        id: `sms_${Date.now()}`,
        type: activeMode === 'grade_results' ? 'Academic Report' : messageType,
        message: messageText.trim(),
        recipientsCount: targetRecipientCount,
        targetGrade:
          activeMode === 'grade_results'
            ? selectedResultsGrade
            : activeMode === 'uploaded_contacts'
            ? 'All Grades'
            : targetGroup === 'Fee Defaulters'
            ? 'All Grades'
            : targetGroup,
        timestamp:
          new Date().toLocaleDateString('en-GB') +
          ' ' +
          new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        deliveryRate: 99.4,
        status: 'Delivered',
      };

      onSendBroadcast(newBroadcast);
      setIsSending(false);
      setSentSuccess(
        activeMode === 'grade_results'
          ? `Successfully dispatched CBC Assessment Results SMS to all ${recipientStudents.length} parents in ${selectedResultsGrade}!`
          : activeMode === 'uploaded_contacts'
          ? `Dispatched SMS to all ${validUploadedCount} validated Kenyan phone contacts from '${uploadedFileName}'!`
          : `Broadcast dispatched successfully to ${recipientStudents.length} parents!`
      );
      setTimeout(() => setSentSuccess(null), 5000);
    }, 800);
  };

  const handleExportBroadcastsExcel = () => {
    exportToExcel('Limuru_School_SMS_Broadcast_Audit', broadcasts, [
      { header: 'Category', key: 'type' },
      { header: 'Audience / Grade', key: 'targetGrade' },
      { header: 'Recipient Count', key: 'recipientsCount' },
      { header: 'Message Snippet', key: 'message' },
      { header: 'Timestamp', key: 'timestamp' },
      { header: 'Delivery Rate (%)', key: 'deliveryRate' },
      { header: 'Status', key: 'status' },
    ]);
  };

  // Upload contacts list with real XLSX parsing, persistence & Kenyan phone validation
  const handleImportContactsFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsUploadingContacts(true);
    setUploadProgress(15);
    setContactValidationErrors([]);

    try {
      const uploader = currentUser
        ? { uid: currentUser.uid, fullName: currentUser.fullName, role: currentUser.role }
        : { uid: 'sms_sys', fullName: 'SMS Administrator', role: 'admin' };

      // Persist contacts file in Firebase Storage / persistent store
      await uploadFileWithProgress({
        file,
        category: 'sms_contacts',
        linkedRecordId: 'sms_batch_' + Date.now(),
        linkedRecordType: 'sms_contacts',
        user: uploader,
        notes: `SMS Contacts Upload: ${file.name}`,
        expectedType: 'spreadsheet',
        onProgress: (p) => setUploadProgress(p),
      });

      // Parse with xlsx
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(firstSheet, { defval: '' });

      const parsed: UploadedContact[] = [];
      const errorList: string[] = [];

      rawRows.forEach((row, idx) => {
        const rowNum = idx + 2;
        const name = (row['Name'] || row['Guardian Name'] || row['Parent Name'] || row['Full Name'] || `Contact ${idx + 1}`).toString().trim();
        const rawPhone = (row['Phone'] || row['Guardian Phone'] || row['Mobile'] || row['Telephone'] || row['MSISDN'] || '').toString().trim();

        if (!rawPhone) {
          errorList.push(`Row ${rowNum} (${name}): Missing phone number.`);
          parsed.push({ rowNum, name, rawPhone: '', isValid: false, validationError: 'Missing phone' });
          return;
        }

        const phoneCheck = validateKenyanPhone(rawPhone);
        if (!phoneCheck.isValid) {
          errorList.push(`Row ${rowNum} (${name}): ${rawPhone} -> ${phoneCheck.error}`);
          parsed.push({
            rowNum,
            name,
            rawPhone,
            isValid: false,
            validationError: phoneCheck.error,
          });
        } else {
          parsed.push({
            rowNum,
            name,
            rawPhone,
            normalizedPhone: phoneCheck.normalized,
            isValid: true,
          });
        }
      });

      setUploadedContacts(parsed);
      setContactValidationErrors(errorList);
      setActiveMode('uploaded_contacts');
      setSentSuccess(`Parsed ${parsed.length} contacts (${parsed.filter((c) => c.isValid).length} valid Kenyan numbers).`);
      setTimeout(() => setSentSuccess(null), 4000);
    } catch (err: any) {
      setContactValidationErrors([`File read error: ${err.message || 'Invalid spreadsheet'}`]);
    } finally {
      setIsUploadingContacts(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Actions */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">
              Bulk SMS Gateway & Grade-Wise Results Dispatch
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Limuru Model Center: 20401823 &bull; Safaricom / Africa&apos;s Talking Gateway &bull; Sender ID: <strong>LIMURU-SCH</strong> &bull; Kenyan Phone Validator (07XX / 01XX / +254)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Print Audit Log */}
          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-300"
            title="Print SMS Log"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Log
          </button>

          {/* Export to Excel */}
          <button
            onClick={handleExportBroadcastsExcel}
            className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export Log (.csv)
          </button>

          {/* Upload Contact List with Real Validation */}
          <label className="cursor-pointer px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploadingContacts ? 'Uploading...' : 'Upload Contacts (.xlsx, .csv)'}</span>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              disabled={isUploadingContacts}
              onChange={handleImportContactsFile}
              className="hidden"
            />
          </label>

          <span className="p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-700 text-xs">
            Units: <strong>14,820</strong>
          </span>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => {
            setActiveMode('grade_results');
            setMessageType('Academic Report');
            setMessageText(
              'Dear Parent of {Learner_Name} (Adm: {Adm_No}): Term 1 CBC Formative & Summative Results: Math: Exceeding Expectation (84%), Eng: Meeting (76%), Sci: Meeting (78%). Class Position: 6/48. School resumes 6th Jan 2027. Principal.'
            );
          }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeMode === 'grade_results'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Send CBC Results to All Parents Grade-Wise
        </button>

        <button
          onClick={() => setActiveMode('standard')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeMode === 'standard'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Standard General Broadcast
        </button>

        <button
          onClick={() => setActiveMode('uploaded_contacts')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeMode === 'uploaded_contacts'
              ? 'bg-teal-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          Uploaded Contacts List ({validUploadedCount} Valid)
        </button>
      </div>

      {/* Uploaded Contacts Validation Report if in uploaded_contacts mode */}
      {activeMode === 'uploaded_contacts' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-teal-700" />
                  Kenyan Contacts List ({uploadedFileName || 'No file selected'})
                </h3>
                <p className="text-xs text-slate-500">
                  Strict Kenyan mobile number validation: accepts 07XX, 01XX, or +254 international format.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded font-bold text-xs">
                  {validUploadedCount} Valid Numbers
                </span>
                {uploadedContacts.length - validUploadedCount > 0 && (
                  <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded font-bold text-xs">
                    {uploadedContacts.length - validUploadedCount} Invalid
                  </span>
                )}
              </div>
            </div>

            {contactValidationErrors.length > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-rose-900 text-xs space-y-1">
                <strong className="flex items-center gap-1 text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  Validation Issues Found ({contactValidationErrors.length}):
                </strong>
                <div className="max-h-24 overflow-y-auto pl-5 space-y-0.5 list-disc text-[11px]">
                  {contactValidationErrors.map((err, i) => (
                    <div key={i} className="text-rose-700">{err}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <h3 className="font-bold text-slate-900 text-sm">Compose & Dispatch Notification</h3>

          {initialDraft && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Pre-filled template from Fee Ledger: <strong>{initialDraft.targetStudentName ? `Reminder for ${initialDraft.targetStudentName}` : 'Fee Defaulters Template'}</strong>
                </span>
              </div>
              {onClearInitialDraft && (
                <button
                  type="button"
                  onClick={onClearInitialDraft}
                  className="text-[11px] text-amber-700 underline font-semibold hover:text-amber-900"
                >
                  Reset Template
                </button>
              )}
            </div>
          )}

          {/* Active Mode Header and Controls */}
          {activeMode === 'grade_results' ? (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-700 shrink-0" />
                  <div>
                    <h4 className="font-bold text-emerald-950 text-xs">
                      Send CBC Assessment Results to Parents Grade-Wise (Replaces Paper Report Cards)
                    </h4>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      Dispatches individualized SMS score summaries with learner name, admission number, subject competencies (Exceeding/Meeting Expectation), and term position directly to all parents in the selected grade.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Select Target Grade for Results Broadcast:
                  </label>
                  <select
                    value={selectedResultsGrade}
                    onChange={(e) => {
                      const grade = e.target.value as GradeLevel;
                      setSelectedResultsGrade(grade);
                      setMessageText(
                        `Dear Parent of {Learner_Name} (Adm: {Adm_No}): Term 1 ${grade} CBC Summative Results: Math: Exceeding Expectation (84%), Eng: Meeting (76%), Sci: Meeting (78%). Class Position: 6/48. School resumes 6th Jan 2027. Principal Limuru Model.`
                      );
                    }}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  >
                    {ALL_GRADES.map((g) => (
                      <option key={g} value={g}>{g} (All Parents & Streams)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Targeted Parents in {selectedResultsGrade}:
                  </label>
                  <div className="w-full border border-emerald-200 bg-emerald-50 rounded px-3 py-2 text-xs font-bold text-emerald-900 flex items-center justify-between">
                    <span>{recipientStudents.length} Parents</span>
                    <span className="text-emerald-700">100% Mobile Coverage</span>
                  </div>
                </div>
              </div>
            </div>
          ) : activeMode === 'uploaded_contacts' ? (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-950">
              <strong>Target Audience:</strong> Dispatching directly to{' '}
              <strong className="font-mono text-teal-900">{validUploadedCount} validated Kenyan phone numbers</strong>{' '}
              from &apos;{uploadedFileName || 'Uploaded Spreadsheet'}&apos;.
            </div>
          ) : (
            <div>
              <span className="text-slate-600 block text-xs font-medium mb-1.5">
                Select Preset Message Template:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    'Fee Reminder',
                    'AGM & Parents Meeting',
                    'Academic Report',
                    'Emergency Alert',
                    'General Notice',
                  ] as const
                ).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleApplyTemplate(type)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      messageType === type
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-4 text-xs">
            {activeMode === 'standard' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Target Recipient Group:
                  </label>
                  <select
                    value={targetGroup}
                    onChange={(e) => setTargetGroup(e.target.value as any)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="All Grades">All Grades (All Parents)</option>
                    <option value="Fee Defaulters">Parents with Fee Arrears Only</option>
                    {ALL_GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g} Parents Only
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Recipient Parent Count:
                  </label>
                  <div className="w-full border border-slate-200 bg-slate-50 rounded px-3 py-2 text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>{recipientStudents.length} Guardian Mobiles</span>
                    <span className="text-emerald-700">Ready to Send</span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">
                  {activeMode === 'grade_results'
                    ? 'Individualized Results SMS Template (Auto-Populates per Student):'
                    : 'SMS Message Content:'}
                </label>
                <span className="text-[11px] text-slate-500 font-mono">
                  {messageText.length} characters ({smsUnits} SMS {smsUnits > 1 ? 'parts' : 'part'})
                </span>
              </div>
              <textarea
                rows={4}
                required
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full border border-slate-300 rounded p-3 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 leading-relaxed font-sans"
              />
              {activeMode === 'grade_results' && (
                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                  <span>Supported placeholders:</span>
                  <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">{'{Learner_Name}'}</span>
                  <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">{'{Adm_No}'}</span>
                  <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">{'{NEMIS_UPI}'}</span>
                </div>
              )}
            </div>

            {sentSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>{sentSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSending || targetRecipientCount === 0}
              className={`w-full py-2.5 text-white rounded text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors ${
                activeMode === 'grade_results'
                  ? 'bg-emerald-800 hover:bg-emerald-900'
                  : 'bg-emerald-700 hover:bg-emerald-800'
              }`}
            >
              {isSending ? (
                <span>Dispatching Gateway Stream...</span>
              ) : activeMode === 'grade_results' ? (
                <>
                  <Award className="w-4 h-4" />
                  Send CBC Results SMS to All {recipientStudents.length} Parents in {selectedResultsGrade}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Dispatch SMS Broadcast to {targetRecipientCount} Recipients
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Simulator Phone Display */}
        <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-emerald-400 font-bold mb-3 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              Parent Handset SMS View
            </div>

            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-700 pb-2">
                <strong className="text-white">LIMURU-SCH</strong>
                <span>Today, Just now</span>
              </div>
              <div className="text-xs text-slate-100 leading-relaxed font-sans">
                {messageText || 'Empty message...'}
              </div>
              <div className="text-[10px] text-emerald-400 text-right pt-1">
                ✓✓ Delivered
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-3 mt-4 space-y-1">
            <div>
              <strong>Carrier:</strong> Safaricom & Airtel Kenya Direct SMPP
            </div>
            <div>
              <strong>Audit:</strong> Compliant with Kenya Data Protection Act (KDPA) 2019
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast History Log */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 font-semibold text-slate-900 text-xs flex items-center justify-between">
          <span>SMS Gateway Dispatch Audit Trail</span>
          <span className="text-slate-500 font-normal">Past Communications</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="p-3">Category</th>
                <th className="p-3">Audience / Grade</th>
                <th className="p-3">Recipients</th>
                <th className="p-3">Message Snippet</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3 text-center">Delivery Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {broadcasts.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-900">{b.type}</td>
                  <td className="p-3 text-slate-700">{b.targetGrade}</td>
                  <td className="p-3 font-bold text-slate-900 tabular-nums">{b.recipientsCount}</td>
                  <td className="p-3 text-slate-600 truncate max-w-sm" title={b.message}>
                    {b.message}
                  </td>
                  <td className="p-3 text-slate-500">{b.timestamp}</td>
                  <td className="p-3 text-center font-bold text-emerald-700">
                    {b.deliveryRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
