import React, { useState } from 'react';
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
} from 'lucide-react';
import { Learner, SMSBroadcast, GradeLevel } from '../types/school';
import { ALL_GRADES } from '../data/mockSchoolData';
import { exportToExcel } from '../utils/excelExport';

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

export function BulkSMSGateway({ students, broadcasts, onSendBroadcast, initialDraft, onClearInitialDraft }: Props) {
  const [activeMode, setActiveMode] = useState<'standard' | 'grade_results'>('grade_results');
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

  React.useEffect(() => {
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
    if (!messageText.trim() || recipientStudents.length === 0) return;

    setIsSending(true);
    setSentSuccess(null);

    setTimeout(() => {
      const newBroadcast: SMSBroadcast = {
        id: `sms_${Date.now()}`,
        type: activeMode === 'grade_results' ? 'Academic Report' : messageType,
        message: messageText.trim(),
        recipientsCount: recipientStudents.length,
        targetGrade: activeMode === 'grade_results' ? selectedResultsGrade : (targetGroup === 'Fee Defaulters' ? 'All Grades' : targetGroup),
        timestamp: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        deliveryRate: 99.2,
        status: 'Delivered',
      };

      onSendBroadcast(newBroadcast);
      setIsSending(false);
      setSentSuccess(
        activeMode === 'grade_results'
          ? `Successfully dispatched CBC Assessment Results SMS to all ${recipientStudents.length} parents in ${selectedResultsGrade}!`
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

  const handleImportContactsCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const count = text.split('\n').filter((l) => l.trim().length > 0).length - 1;
      setSentSuccess(`Verified ${Math.max(1, count)} parent contacts from ${file.name}. Ready for broadcast.`);
      setTimeout(() => setSentSuccess(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Actions */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">
              Bulk SMS Gateway & Grade-Wise Results Dispatch
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Safaricom / Africa&apos;s Talking Gateway · Sender ID: <strong>LIMURU-SCH</strong> · Send term CBC results grade-wise directly to parent phones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Print Audit Log */}
          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-300"
            title="Print SMS Log"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Log
          </button>

          {/* Export to Excel */}
          <button
            onClick={handleExportBroadcastsExcel}
            className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export Log (.csv)
          </button>

          {/* Upload Contact List */}
          <label className="cursor-pointer px-3 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Contacts (.csv)</span>
            <input type="file" accept=".csv,.txt" onChange={handleImportContactsCsv} className="hidden" />
          </label>

          <span className="p-2 bg-slate-50 border border-slate-200 rounded font-mono text-slate-700 text-xs">
            Units: <strong>14,820</strong>
          </span>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => {
            setActiveMode('grade_results');
            setMessageType('Academic Report');
            setMessageText(
              'Dear Parent of {Learner_Name} (Adm: {Adm_No}): Term 1 CBC Formative & Summative Results: Math: Exceeding Expectation (84%), Eng: Meeting (76%), Sci: Meeting (78%). Class Position: 6/48. School resumes 6th Jan 2027. Principal.'
            );
          }}
          className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors flex items-center gap-2 ${
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
          className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeMode === 'standard'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Standard General Broadcast
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-5">
          <h3 className="font-semibold text-slate-900 text-sm">Compose & Dispatch Notification</h3>

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
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Grade 7">Grade 7 (All Parents & Streams)</option>
                    <option value="Grade 8">Grade 8 (All Parents & Streams)</option>
                    <option value="Grade 9">Grade 9 (All Parents & Streams)</option>
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
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                className="w-full border border-slate-300 rounded p-3 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed font-sans"
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
              disabled={isSending || recipientStudents.length === 0}
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
                  Dispatch SMS Broadcast to {recipientStudents.length} Parents
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Simulator Phone Display */}
        <div className="bg-slate-900 text-white p-5 rounded-lg border border-slate-800 flex flex-col justify-between">
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
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
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
