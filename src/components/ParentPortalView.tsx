/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CreditCard,
  Smartphone,
  Award,
  Calendar,
  HeartPulse,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  BookOpen,
  Radio,
  Clock,
  Sparkles,
  Phone,
  Mail,
  User,
  Activity,
  Layers,
} from 'lucide-react';
import {
  Learner,
  GradeLevel,
  CBCLevel,
  DarajaMpesaPayment,
  TimetableSlot,
  SMSBroadcast,
  AuthUser,
} from '../types/school';

interface ParentPortalViewProps {
  currentUser: AuthUser;
  learners: Learner[];
  timetableSlots: TimetableSlot[];
  smsBroadcasts: SMSBroadcast[];
  onProcessPayment: (payment: DarajaMpesaPayment) => void;
  onViewReportCard: (studentId: string) => void;
}

export const ParentPortalView: React.FC<ParentPortalViewProps> = ({
  currentUser,
  learners,
  timetableSlots,
  smsBroadcasts,
  onProcessPayment,
  onViewReportCard,
}) => {
  // Determine child: find learner matching linkedLearnerId, default to std_g7_01 (Brian Omondi)
  const defaultLearnerId = currentUser.linkedLearnerId || 'std_g7_01';
  const [selectedChildId, setSelectedChildId] = useState<string>(defaultLearnerId);

  // Allow switching if parent has multiple children (simulate siblings)
  const myChildren = learners.filter(
    (l) => l.id === 'std_g7_01' || l.id === 'std_g1_01' // Brian Omondi & Liam Kamau
  );

  const activeChild = learners.find((l) => l.id === selectedChildId) || learners[0];

  // Active sub-tab in parent portal
  const [parentSubTab, setParentSubTab] = useState<'fees' | 'academics' | 'timetable' | 'health' | 'messages'>('fees');

  // M-Pesa STK Push Simulation state
  const [mpesaAmount, setMpesaAmount] = useState<number>(5000);
  const [mpesaPhone, setMpesaPhone] = useState<string>(currentUser.phone || '+254 722 890 144');
  const [stkStatus, setStkStatus] = useState<'idle' | 'prompt' | 'processing' | 'success'>('idle');
  const [mpesaPin, setMpesaPin] = useState<string>('');
  const [lastReceipt, setLastReceipt] = useState<string | null>(null);

  // Filter child's timetable
  const childTimetable = timetableSlots.filter(
    (slot) => slot.grade === activeChild.grade && slot.stream === activeChild.stream
  );

  // Filter messages for this grade or all
  const childMessages = smsBroadcasts.filter(
    (msg) => msg.targetGrade === 'All Grades' || msg.targetGrade === activeChild.grade
  );

  // Handle STK Push
  const handleInitiateStk = (e: React.FormEvent) => {
    e.preventDefault();
    if (mpesaAmount <= 0) return;
    setStkStatus('prompt');
  };

  const handleConfirmPin = () => {
    setStkStatus('processing');
    setTimeout(() => {
      const transId = 'QKH' + Math.floor(10000000 + Math.random() * 90000000);
      const receiptNo = 'RCP-DAR-' + Math.floor(1000 + Math.random() * 9000);

      const newPayment: DarajaMpesaPayment = {
        transId,
        billRefNumber: activeChild.admissionNo,
        msisdn: mpesaPhone,
        firstName: currentUser.name.split(' ')[0] || 'Grace',
        transAmount: Number(mpesaAmount),
        transTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        matchedLearnerId: activeChild.id,
        matchedLearnerName: activeChild.name,
        allocatedVotehead: 'Tuition & Learning Materials',
        receiptNumber: receiptNo,
        smsStatus: 'Sent',
      };

      onProcessPayment(newPayment);
      setLastReceipt(receiptNo);
      setStkStatus('success');
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Privacy & Safeguard Banner */}
      <div className="bg-emerald-900 text-emerald-100 p-4 rounded-xl border border-emerald-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-800/80 border border-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              Limuru Model Comprehensive School — Parent Portal
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-200 border border-emerald-700">
                End-to-End Encrypted Session
              </span>
            </div>
            <p className="text-xs text-emerald-300">
              Welcome, <strong>{currentUser.name}</strong>. Logged in with custodial access for{' '}
              <strong className="text-white">{activeChild.name}</strong>.
            </p>
          </div>
        </div>

        {/* Sibling Switcher if applicable */}
        <div className="flex items-center gap-2 shrink-0 bg-emerald-950/60 p-1.5 rounded-lg border border-emerald-800/80 text-xs">
          <span className="text-emerald-300 font-medium px-1">Learner:</span>
          {myChildren.map((child) => (
            <button
              key={child.id}
              onClick={() => setSelectedChildId(child.id)}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${
                selectedChildId === child.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-300 hover:text-white hover:bg-emerald-900'
              }`}
            >
              {child.name.split(' ')[0]} ({child.grade})
            </button>
          ))}
        </div>
      </div>

      {/* Child Identity Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg font-bold border-2 border-emerald-600 shadow-xs shrink-0">
              {activeChild.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-extrabold text-slate-900">{activeChild.name}</h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {activeChild.grade} · {activeChild.stream}
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-sky-50 text-sky-800 border border-sky-200">
                  NEMIS: {activeChild.nemisUpi}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>Adm No: <strong className="text-slate-800">{activeChild.admissionNo}</strong></span>
                <span>KNEC No: <strong className="text-slate-800">{activeChild.assessmentNo}</strong></span>
                <span>Term Attendance: <strong className="text-emerald-700">{activeChild.attendancePercent}%</strong></span>
                <span>Class Master: <strong className="text-slate-800">Mr. Patrick Wanjala</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onViewReportCard(activeChild.id)}
              className="px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Print Term 1 Report Card
            </button>
          </div>
        </div>

        {/* Parent Portal Navigation Sub-tabs */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'fees', label: 'Fees & Paybill M-Pesa', icon: CreditCard },
            { id: 'academics', label: 'CBC Assessment & Marks', icon: Award },
            { id: 'timetable', label: 'Class Timetable', icon: Calendar },
            { id: 'health', label: 'Medical & Wellbeing Profile', icon: HeartPulse },
            { id: 'messages', label: 'School SMS Inbox', icon: Radio },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = parentSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setParentSubTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          SUB-TAB 1: FEES & M-PESA STK PUSH (PAYBILL 522123)
          ========================================================================= */}
      {parentSubTab === 'fees' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fee Balance Overview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
                <span>Term 1 Fee Statement & Ledger</span>
                <span
                  className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                    activeChild.fees.status === 'Cleared'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : activeChild.fees.status === 'Partial'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  Status: {activeChild.fees.status.toUpperCase()}
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Total Term Invoiced</div>
                  <div className="text-xl font-bold text-slate-900 tabular-nums">
                    KES {activeChild.fees.totalTermFee.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Ministry Approved Fee</div>
                </div>

                <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200">
                  <div className="text-xs text-emerald-700 font-medium mb-1">Total Amount Cleared</div>
                  <div className="text-xl font-bold text-emerald-800 tabular-nums">
                    KES {activeChild.fees.paidAmount.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-emerald-600 mt-1">Includes receipts & bursary</div>
                </div>

                <div className="p-4 rounded-lg bg-slate-900 text-white border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">Outstanding Arrears</div>
                  <div className="text-xl font-bold text-white tabular-nums">
                    KES {activeChild.fees.balance.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-emerald-400 mt-1">
                    {activeChild.fees.balance === 0 ? '✓ Zero arrears' : 'Payment required'}
                  </div>
                </div>
              </div>

              {/* Votehead Itemized breakdown */}
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Approved Votehead Allocation Breakdown
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
                {Object.entries(activeChild.fees.voteheadBreakdown).map(([votehead, data]) => {
                  const paidPercent = Math.min(100, Math.round((data.paid / (data.allocated || 1)) * 100));
                  return (
                    <div key={votehead} className="p-3 bg-white hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-4">
                      <div className="w-1/3">
                        <div className="font-semibold text-slate-900">{votehead}</div>
                        <div className="text-[11px] text-slate-500">Allocated: KES {data.allocated.toLocaleString()}</div>
                      </div>
                      <div className="flex-1 max-w-xs">
                        <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                          <span>Paid: KES {data.paid.toLocaleString()}</span>
                          <span className="font-semibold">{paidPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              paidPercent >= 100 ? 'bg-emerald-600' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${paidPercent}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right w-24">
                        <span
                          className={`font-semibold ${
                            data.paid >= data.allocated ? 'text-emerald-700' : 'text-slate-800'
                          }`}
                        >
                          KES {data.paid.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Capitation notice */}
              <div className="mt-4 p-3 bg-sky-50 rounded-lg border border-sky-200 text-xs text-sky-900 flex items-center justify-between">
                <div>
                  <strong>Government Capitation (FPE/FDSE):</strong> KES {activeChild.fees.capitationReceived.toLocaleString()} received directly into school operations account.
                </div>
                {activeChild.fees.bursaryApplied > 0 && (
                  <span className="font-bold text-sky-800">
                    Bursary Disbursed: KES {activeChild.fees.bursaryApplied.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Lipa Na M-Pesa Online STK Push Simulator */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg tracking-wider uppercase">
                Instant Daraja 2.0 Sync
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Lipa Na M-Pesa Online</h3>
                  <p className="text-xs text-slate-500">Official Paybill: <strong>522123</strong></p>
                </div>
              </div>

              <form onSubmit={handleInitiateStk} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Student Account No (Admission No)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={activeChild.admissionNo}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md font-mono text-slate-700 font-bold"
                  />
                  <span className="text-[11px] text-slate-400">Locked to your child for automated clearing</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Safaricom Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    placeholder="0722XXXXXX"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Amount to Pay (KES)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-semibold">KES</span>
                    <input
                      type="number"
                      required
                      min={100}
                      step={100}
                      value={mpesaAmount}
                      onChange={(e) => setMpesaAmount(Number(e.target.value))}
                      className="w-full pl-12 pr-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-bold text-slate-900"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[1000, 2500, 5000, 10000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setMpesaAmount(amt)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium"
                      >
                        +{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={stkStatus === 'processing'}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-4 h-4" />
                  Send M-Pesa STK Push
                </button>
              </form>

              {/* Interactive STK Push Modal / Prompt Simulator */}
              {stkStatus === 'prompt' && (
                <div className="mt-4 p-4 rounded-xl bg-slate-900 text-white border border-emerald-500 animate-in fade-in zoom-in-95">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-2">
                    <Smartphone className="w-4 h-4 animate-pulse" />
                    Safaricom M-Pesa Prompt on Phone
                  </div>
                  <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                    Do you want to pay <strong>KES {mpesaAmount.toLocaleString()}</strong> to{' '}
                    <strong>Limuru Model Comprehensive School (Paybill 522123)</strong> for Account{' '}
                    <strong>{activeChild.admissionNo}</strong>?
                  </p>
                  <div className="space-y-2">
                    <label className="text-[11px] text-slate-400 block">Enter M-Pesa 4-Digit PIN:</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={mpesaPin}
                      onChange={(e) => setMpesaPin(e.target.value)}
                      placeholder="••••"
                      className="w-full px-3 py-1.5 text-center font-mono text-base tracking-widest bg-slate-800 border border-slate-700 rounded-md text-white focus:ring-1 focus:ring-emerald-400 focus:outline-hidden"
                    />
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleConfirmPin}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 font-bold rounded text-xs transition-colors"
                      >
                        Authorize Payment
                      </button>
                      <button
                        onClick={() => setStkStatus('idle')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Processing Spinner */}
              {stkStatus === 'processing' && (
                <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-emerald-900">Reconciling Daraja 2.0 Webhook...</p>
                </div>
              )}

              {/* Payment Success Confirmation */}
              {stkStatus === 'success' && (
                <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Payment Confirmed & Ledger Updated!
                  </div>
                  <p className="text-xs text-emerald-900 leading-relaxed">
                    Receipt <strong>{lastReceipt}</strong> generated. Instant SMS receipt delivered to{' '}
                    <strong>{mpesaPhone}</strong>.
                  </p>
                  <button
                    onClick={() => {
                      setStkStatus('idle');
                      setMpesaPin('');
                    }}
                    className="text-xs text-emerald-700 underline font-semibold hover:text-emerald-900"
                  >
                    Done / Make Another Payment
                  </button>
                </div>
              )}
            </div>

            {/* Offline Bank Instructions */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2 text-slate-600">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-slate-700" />
                Direct Bank Deposit Details
              </div>
              <p>
                <strong>Bank:</strong> KCB Bank Kenya · Limuru Branch<br />
                <strong>Account Name:</strong> Limuru Model Comprehensive School BoM<br />
                <strong>Account No:</strong> 1184029184<br />
                <strong>Reference:</strong> {activeChild.admissionNo} ({activeChild.name})
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 2: ACADEMICS & CONTINUOUS CBC ASSESSMENTS
          ========================================================================= */}
      {parentSubTab === 'academics' && (
        <div className="space-y-6">
          {/* Competency Radar & Values summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
                <span>CBC 7 Core Competencies Mastery</span>
                <span className="text-xs text-emerald-700 font-semibold">Scale: 1 to 5</span>
              </h3>
              <div className="space-y-3 text-xs">
                {Object.entries(activeChild.competencies).map(([comp, score]) => {
                  const label =
                    comp === 'communication' ? 'Communication & Collaboration' :
                    comp === 'criticalThinking' ? 'Critical Thinking & Problem Solving' :
                    comp === 'digitalLiteracy' ? 'Digital Literacy' :
                    comp === 'citizenship' ? 'Citizenship' :
                    comp === 'creativity' ? 'Creativity & Imagination' : 'Self-Efficacy';
                  return (
                    <div key={comp}>
                      <div className="flex justify-between text-slate-700 mb-1">
                        <span className="font-medium">{label}</span>
                        <strong className="text-slate-900">{score} / 5</strong>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${(score / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">Class Master Remarks & Values</h3>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 italic leading-relaxed mb-4">
                  "{activeChild.valuesNotes}"
                </div>
                <div className="text-xs space-y-1.5 text-slate-600">
                  <div><strong>Co-Curricular Activities:</strong> {activeChild.coCurricular}</div>
                  <div><strong>Term Discipline Record:</strong> {activeChild.disciplineIncidents.length === 0 ? '✓ Exemplary conduct with no disciplinary infractions.' : `${activeChild.disciplineIncidents.length} record(s) under review.`}</div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Official Report Card format ready</span>
                <button
                  onClick={() => onViewReportCard(activeChild.id)}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  View Printable PDF
                </button>
              </div>
            </div>
          </div>

          {/* Subject-Wise Assessment Scorecard */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Formative & Summative Learning Area Scorecard
              </h3>
              <span className="text-xs text-slate-500">
                Term 1 Mid-Term Assessment (KNEC Aligned)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                    <th className="py-2.5 px-4">Subject / Learning Area</th>
                    <th className="py-2.5 px-4 text-center">Formative Rating</th>
                    <th className="py-2.5 px-4 text-center">Summative Mark (100%)</th>
                    <th className="py-2.5 px-4">Teacher Professional Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(activeChild.assessments).map(([subjKey, ass]) => {
                    const subjTitle =
                      subjKey === 'mat' ? 'Mathematics' :
                      subjKey === 'eng' ? 'English Language' :
                      subjKey === 'kis' ? 'Kiswahili' :
                      subjKey === 'sci' ? 'Integrated Science' :
                      subjKey === 'agr' ? 'Agriculture & Nutrition' :
                      subjKey === 'pre_tech' ? 'Pre-Technical Studies' :
                      subjKey === 'soc' ? 'Social Studies' :
                      subjKey === 'cre_ire' ? 'Religious Education' :
                      subjKey === 'arts_sports' ? 'Creative Arts & Sports' :
                      subjKey === 'pri_lit' ? 'Literacy Activities' :
                      subjKey === 'pri_num' ? 'Numeracy Activities' :
                      subjKey === 'pri_env' ? 'Environmental Activities' : subjKey.toUpperCase();

                    const levelBadge =
                      ass.level === 'EE' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                      ass.level === 'ME' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                      ass.level === 'AE' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                      'bg-rose-100 text-rose-800 border-rose-300';

                    return (
                      <tr key={subjKey} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{subjTitle}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded border text-[11px] font-bold ${levelBadge}`}>
                            {ass.level} ({ass.level === 'EE' ? 'Exceeding' : ass.level === 'ME' ? 'Meeting' : ass.level === 'AE' ? 'Approaching' : 'Below'})
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-900 tabular-nums">
                          {ass.summativeScore}%
                        </td>
                        <td className="py-3 px-4 text-slate-600 italic">
                          "{ass.remarks}"
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
          SUB-TAB 3: TIMETABLE
          ========================================================================= */}
      {parentSubTab === 'timetable' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Weekly Class Routine — {activeChild.grade} ({activeChild.stream})
              </h3>
              <p className="text-xs text-slate-500">
                School starts at 7:45 AM · Morning Assembly on Monday & Friday
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              Term 1 2026 Master Timetable
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                  <th className="py-2.5 px-3">Day</th>
                  <th className="py-2.5 px-3">Period</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Subject / Activity</th>
                  <th className="py-2.5 px-3">Subject Teacher</th>
                  <th className="py-2.5 px-3">Room / Facility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {childTimetable.length > 0 ? (
                  childTimetable.map((slot) => (
                    <tr key={slot.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{slot.day}</td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-800">Lesson {slot.period}</td>
                      <td className="py-2.5 px-3 text-slate-500 tabular-nums">{slot.time}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{slot.subject}</td>
                      <td className="py-2.5 px-3 text-slate-600">{slot.teacher}</td>
                      <td className="py-2.5 px-3 text-slate-500">{slot.room}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      Standard timetable for {activeChild.grade} is running Monday to Friday (Periods 1 to 8).
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 4: HEALTH & MEDICAL WELLBEING PROFILE
          ========================================================================= */}
      {parentSubTab === 'health' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-600" />
              Emergency Health & Clinical Record
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block mb-0.5">Blood Group</span>
                <strong className="text-base text-slate-900 font-bold">{activeChild.bloodGroup || 'O+'}</strong>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                <span className="font-semibold block mb-0.5">Allergies & Medical Precautions</span>
                <p className="leading-relaxed font-medium">
                  {activeChild.medicalAllergies || 'No known food or pharmaceutical allergies on file.'}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block mb-0.5">Primary Emergency Contact</span>
                <strong className="text-slate-900 font-bold">{activeChild.guardianName}</strong>
                <div className="text-slate-600 mt-0.5 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{activeChild.guardianPhone}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              School Dispensary & Pastoral Protocol
            </h3>
            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                Limuru Model Comprehensive School retains a full-time resident Registered Nurse and emergency vehicle on campus.
              </p>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <strong className="text-slate-900 block mb-1">Sub-County Referral Hospital:</strong>
                Limuru Sub-County Level 4 Hospital (5 minutes via A104).
              </div>
              <p className="text-[11px] text-slate-400">
                To update medical prescriptions or dietary requirements, kindly notify the Class Master or Deputy Principal.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 5: SCHOOL SMS INBOX
          ========================================================================= */}
      {parentSubTab === 'messages' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-600" />
              Official SMS Notifications Received
            </h3>
            <span className="text-xs text-slate-500 font-mono">Sender: LIMURUSCH</span>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
            {childMessages.map((msg) => (
              <div key={msg.id} className="p-4 bg-white hover:bg-slate-50/60 transition-colors space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {msg.type}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">{msg.timestamp}</span>
                </div>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-[11px] leading-relaxed">
                  {msg.message}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Target: {msg.targetGrade}</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Delivered to {currentUser.phone}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
