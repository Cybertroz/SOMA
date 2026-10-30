/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  HeartPulse,
  Award,
  ShieldAlert,
  UserCheck,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  Activity,
  Lock,
  FileText,
  Syringe,
  ClipboardList,
  ShieldCheck,
  FolderOpen,
  Ambulance,
  Building,
  Clock,
  Send,
  History,
  Bell,
  Phone,
  Mail,
  FilePlus,
  AlertCircle,
  X,
  Thermometer,
} from 'lucide-react';
import { Learner, DisciplineIncident, SicknessRecord, HospitalReferral } from '../types/school';
import { INITIAL_SICKNESS_RECORDS, INITIAL_HOSPITAL_REFERRALS } from '../data/mockHealthData';
import { exportToExcel } from '../utils/excelExport';
import { FileUploadZone } from './FileUploadZone';
import { useAuth } from '../context/AuthContext';

interface Props {
  students: Learner[];
  onAddDisciplineIncident: (studentId: string, incident: DisciplineIncident) => void;
}

export function DigitalPortfoliosAndCoCurricular({ students, onAddDisciplineIncident }: Props) {
  const { currentUser } = useAuth();
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [isAddIncidentOpen, setIsAddIncidentOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<
    'health_medical' | 'sickness_records' | 'hospital_referrals' | 'health_history' | 'portfolio_evidence' | 'consent_vaccines' | 'discipline'
  >('health_medical');

  // Sickness & Referrals state
  const [sicknessRecords, setSicknessRecords] = useState<SicknessRecord[]>(INITIAL_SICKNESS_RECORDS);
  const [hospitalReferrals, setHospitalReferrals] = useState<HospitalReferral[]>(INITIAL_HOSPITAL_REFERRALS);
  const [isAddSicknessOpen, setIsAddSicknessOpen] = useState(false);
  const [isAddReferralOpen, setIsAddReferralOpen] = useState(false);
  const [isNotifyBoardingOpen, setIsNotifyBoardingOpen] = useState(false);
  const [activeSicknessForNotify, setActiveSicknessForNotify] = useState<SicknessRecord | null>(null);
  const [notifyChannel, setNotifyChannel] = useState<'SMS' | 'Email' | 'In-App' | 'All Channels (SMS, Email & In-App)'>('All Channels (SMS, Email & In-App)');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sickness Form state
  const [sicknessForm, setSicknessForm] = useState({
    symptoms: '',
    temperatureVitals: 'Temp: 37.8°C, Pulse: 80 bpm, BP: normal',
    actionTaken: 'Paracetamol 500mg administered, 1 hour rest in dispensary observation bay.',
    attendingStaff: 'Sister Beatrice (Resident Nurse)',
    isBoarder: true,
  });

  // Referral Form state
  const [referralForm, setReferralForm] = useState({
    hospitalName: 'Limuru Sub-County Level 4 Hospital',
    accompanyingStaff: 'Sister Beatrice & School Driver',
    diagnosis: 'Suspected severe bacterial infection / laceration',
    treatment: 'Clinical examination, laboratory workup, and intravenous therapy',
    medication: 'Prescription pending medical officer review',
    followUpDate: '2026-04-02',
  });

  const [incidentForm, setIncidentForm] = useState({
    nature: '',
    actionTaken: 'Guidance and counseling session held with deputy principal.',
    reportedBy: 'Class Teacher',
    status: 'Resolved' as DisciplineIncident['status'],
  });

  const student = students.find((s) => s.id === selectedStudentId) || students[0];

  // RBAC: Check if current user is permitted to view sensitive health / medical data
  const userRole = currentUser?.role?.toLowerCase() || '';
  const canAccessSensitiveHealth =
    userRole === 'principal' ||
    userRole === 'admin' ||
    userRole === 'headteacher' ||
    userRole === 'deputy' ||
    userRole === 'nurse' ||
    userRole === 'moe_director';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAddSickness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !sicknessForm.symptoms.trim()) return;

    const newRecord: SicknessRecord = {
      id: `sick_${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      admissionNo: student.admissionNo,
      dateTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      symptoms: sicknessForm.symptoms.trim(),
      temperatureVitals: sicknessForm.temperatureVitals.trim(),
      actionTaken: sicknessForm.actionTaken.trim(),
      attendingStaff: sicknessForm.attendingStaff.trim(),
      isBoarder: sicknessForm.isBoarder,
      notificationSent: false,
    };

    setSicknessRecords([newRecord, ...sicknessRecords]);
    setIsAddSicknessOpen(false);
    setSicknessForm({
      symptoms: '',
      temperatureVitals: 'Temp: 37.8°C, Pulse: 80 bpm, BP: normal',
      actionTaken: 'Paracetamol 500mg administered, 1 hour rest in dispensary observation bay.',
      attendingStaff: 'Sister Beatrice (Resident Nurse)',
      isBoarder: true,
    });
    showToast(`Sickness record logged for ${student.name}.`);
  };

  const handleDispatchBoardingNotification = (record: SicknessRecord) => {
    const updated = sicknessRecords.map((r) =>
      r.id === record.id
        ? {
            ...r,
            notificationSent: true,
            notificationChannel: notifyChannel,
            notificationTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          }
        : r
    );
    setSicknessRecords(updated);
    setIsNotifyBoardingOpen(false);
    setActiveSicknessForNotify(null);
    showToast(`Boarding parent alert dispatched via ${notifyChannel} to ${student?.guardianPhone || 'parents'}.`);
  };

  const handleAddHospitalReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !referralForm.diagnosis.trim()) return;

    const newReferral: HospitalReferral = {
      id: `ref_${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      admissionNo: student.admissionNo,
      hospitalName: referralForm.hospitalName.trim(),
      dateTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      accompanyingStaff: referralForm.accompanyingStaff.trim(),
      diagnosis: referralForm.diagnosis.trim(),
      treatment: referralForm.treatment.trim(),
      medication: referralForm.medication.trim(),
      followUpDate: referralForm.followUpDate,
      status: 'Admitted / Under Evaluation',
      parentNotifiedOnReferral: true,
      parentNotifiedOnReturn: false,
      referralNotificationTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setHospitalReferrals([newReferral, ...hospitalReferrals]);
    setIsAddReferralOpen(false);
    showToast(`Hospital referral to ${newReferral.hospitalName} logged and parent departure notification dispatched.`);
  };

  const handleNotifyReferralReturn = (referralId: string) => {
    const updated = hospitalReferrals.map((r) =>
      r.id === referralId
        ? {
            ...r,
            status: 'Discharged to School Sanatorium' as const,
            parentNotifiedOnReturn: true,
            returnNotificationTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          }
        : r
    );
    setHospitalReferrals(updated);
    showToast('Hospital return alert & discharge notification sent to parents.');
  };

  const handleAddIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !incidentForm.nature.trim()) return;

    const newIncident: DisciplineIncident = {
      id: `disc_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      nature: incidentForm.nature.trim(),
      actionTaken: incidentForm.actionTaken.trim(),
      reportedBy: incidentForm.reportedBy.trim(),
      status: incidentForm.status,
    };

    onAddDisciplineIncident(student.id, newIncident);
    setIncidentForm({
      nature: '',
      actionTaken: 'Guidance and counseling session held with deputy principal.',
      reportedBy: 'Class Teacher',
      status: 'Resolved',
    });
    setIsAddIncidentOpen(false);
  };

  const handleExportPortfolioExcel = () => {
    exportToExcel(
      'Limuru_Model_Learner_CoCurricular_and_Health_Register',
      students,
      [
        { header: 'Admission No', key: 'admissionNo' },
        { header: 'Learner Name', key: 'name' },
        { header: 'Grade', key: 'grade' },
        { header: 'Stream', key: 'stream' },
        { header: 'Blood Group', key: (s) => (canAccessSensitiveHealth ? s.bloodGroup || 'O+' : '[RESTRICTED]') },
        { header: 'Medical / Allergies', key: (s) => (canAccessSensitiveHealth ? s.medicalAllergies || 'None' : '[RESTRICTED]') },
        { header: 'Co-Curricular & Sports', key: 'coCurricular' },
        { header: 'Attendance (%)', key: (s) => `${s.attendancePercent}%` },
        { header: 'Discipline Incident Count', key: (s) => s.disciplineIncidents.length },
      ]
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">
              Digital Portfolios, Health & Co-Curricular Tracking
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Limuru Model School Center: 20401823 &bull; Medical records, CBC evidence portfolios, vaccination tracking, and consent forms
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPortfolioExcel}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            Export Portfolios (.csv)
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Learner selector list */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-200 bg-slate-50 font-bold text-slate-900 text-xs flex items-center justify-between">
            <span>Select Learner Profile:</span>
            <span className="text-[11px] text-slate-500">{students.length} Total</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto">
            {students.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStudentId(s.id)}
                className={`w-full text-left p-3 transition-colors flex items-center justify-between ${
                  s.id === student?.id ? 'bg-emerald-50 text-emerald-950 font-bold border-l-4 border-emerald-700' : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div>
                  <div className="text-xs">{s.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {s.admissionNo} &bull; {s.grade}
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                  {s.stream}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Portfolio Details & Real Document Vault */}
        {student && (
          <div className="lg:col-span-2 space-y-5">
            {/* Learner Card Header */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-bold text-sm overflow-hidden shrink-0">
                  {student.photoUrl ? (
                    <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    student.name.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{student.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <span>{student.admissionNo}</span>
                    <span>&bull;</span>
                    <span>{student.grade} ({student.stream})</span>
                    <span>&bull;</span>
                    <span className="text-emerald-700 font-semibold">{student.kemisStatus}</span>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg overflow-x-auto max-w-full">
                <button
                  onClick={() => setActiveSubTab('health_medical')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    activeSubTab === 'health_medical'
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Clinical Profile
                </button>
                <button
                  onClick={() => setActiveSubTab('sickness_records')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1 ${
                    activeSubTab === 'sickness_records'
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Thermometer className="w-3.5 h-3.5 text-rose-600" />
                  Sickness Records ({sicknessRecords.filter((s) => s.studentId === student.id).length})
                </button>
                <button
                  onClick={() => setActiveSubTab('hospital_referrals')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1 ${
                    activeSubTab === 'hospital_referrals'
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Ambulance className="w-3.5 h-3.5 text-rose-700" />
                  Hospital Referrals ({hospitalReferrals.filter((h) => h.studentId === student.id).length})
                </button>
                <button
                  onClick={() => setActiveSubTab('health_history')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1 ${
                    activeSubTab === 'health_history'
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <History className="w-3.5 h-3.5 text-emerald-700" />
                  Health History
                </button>
                <button
                  onClick={() => setActiveSubTab('portfolio_evidence')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    activeSubTab === 'portfolio_evidence'
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  CBC Evidence
                </button>
                <button
                  onClick={() => setActiveSubTab('consent_vaccines')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    activeSubTab === 'consent_vaccines'
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Vaccines & Consents
                </button>
                <button
                  onClick={() => setActiveSubTab('discipline')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    activeSubTab === 'discipline'
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Discipline ({student.disciplineIncidents.length})
                </button>
              </div>
            </div>

            {/* Sub-tab 1: Health & Medical */}
            {activeSubTab === 'health_medical' && (
              <div className="space-y-4">
                {!canAccessSensitiveHealth ? (
                  <div className="p-6 bg-amber-50 border border-amber-300 rounded-xl text-center space-y-2">
                    <Lock className="w-8 h-8 text-amber-600 mx-auto" />
                    <h4 className="font-bold text-amber-900 text-sm">
                      Sensitive Health Information Restricted
                    </h4>
                    <p className="text-xs text-amber-800 max-w-md mx-auto">
                      Under Kenya Data Protection Act 2019 and Ministry of Education student privacy guidelines,
                      clinical health charts and medical documents are accessible only to the <strong>Principal, Administrator, and School Nurse</strong>.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                          <HeartPulse className="w-4 h-4" />
                          <span>Emergency Medical & Clinical Profile</span>
                        </div>
                        <span className="text-[11px] px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded">
                          Restricted: Principal / Nurse
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <span className="text-slate-500 block">Blood Group:</span>
                          <strong className="text-slate-900 font-bold text-sm">{student.bloodGroup || 'O+'}</strong>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <span className="text-slate-500 block">Attendance Rate:</span>
                          <strong className="text-emerald-700 font-bold text-sm">{student.attendancePercent}%</strong>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 col-span-2 sm:col-span-1">
                          <span className="text-slate-500 block">Emergency Contact:</span>
                          <strong className="text-slate-900 font-mono text-xs">{student.guardianPhone}</strong>
                        </div>
                      </div>

                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-950">
                        <strong className="block mb-0.5 font-bold">Medical Allergies & Pre-Existing Health Conditions:</strong>
                        <p className="text-rose-900 leading-relaxed">
                          {student.medicalAllergies || 'No known chronic allergies or dietary restrictions recorded.'}
                        </p>
                      </div>
                    </div>

                    {/* Medical Documents Upload & Storage Vault */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
                        <FileText className="w-4 h-4 text-emerald-700" />
                        <span>Medical Documents & Clinical Reports (Images / PDF up to 5MB)</span>
                      </div>
                      <FileUploadZone
                        linkedRecordId={student.id}
                        category="medical_document"
                        expectedType="image_or_pdf"
                        label="Upload Medical Documents / Doctor's Notes"
                        helperText="Persisted in secure storage. Access restricted to Principal & Nurse."
                        isSensitive={true}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Sub-tab: Sickness Records & Dispensary Observations */}
            {activeSubTab === 'sickness_records' && (
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-rose-600" />
                        Dispensary Sickness Records & Sanatorium Log
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Track clinical symptoms, vital signs, medications, and boarding parental alerts for {student.name}.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsAddSicknessOpen(true)}
                      className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Log Sickness Event
                    </button>
                  </div>

                  {/* Sickness Table */}
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                          <th className="py-2.5 px-3">Date / Time</th>
                          <th className="py-2.5 px-3">Symptoms Reported</th>
                          <th className="py-2.5 px-3">Temperature & Vitals</th>
                          <th className="py-2.5 px-3">Action Taken / Meds</th>
                          <th className="py-2.5 px-3">Attending Staff</th>
                          <th className="py-2.5 px-3">Boarder / Day</th>
                          <th className="py-2.5 px-3">Parent Notification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sicknessRecords.filter((r) => r.studentId === student.id).length > 0 ? (
                          sicknessRecords
                            .filter((r) => r.studentId === student.id)
                            .map((r) => (
                              <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">{r.dateTime}</td>
                                <td className="py-3 px-3 font-semibold text-slate-900 max-w-xs">{r.symptoms}</td>
                                <td className="py-3 px-3 text-rose-700 font-medium whitespace-nowrap">
                                  <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200">
                                    {r.temperatureVitals}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-slate-700 max-w-xs">{r.actionTaken}</td>
                                <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{r.attendingStaff}</td>
                                <td className="py-3 px-3 whitespace-nowrap">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      r.isBoarder ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {r.isBoarder ? 'Boarder' : 'Day Scholar'}
                                  </span>
                                </td>
                                <td className="py-3 px-3 whitespace-nowrap">
                                  {r.notificationSent ? (
                                    <div className="space-y-0.5">
                                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Dispatched ({r.notificationChannel})
                                      </span>
                                      <div className="text-[10px] text-slate-400 font-mono">
                                        {r.notificationTimestamp}
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setActiveSicknessForNotify(r);
                                        setIsNotifyBoardingOpen(true);
                                      }}
                                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                                    >
                                      <Bell className="w-3 h-3" />
                                      Notify Parents
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-400">
                              No recent sickness incidents recorded for {student.name}.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab: Hospital Referrals */}
            {activeSubTab === 'hospital_referrals' && (
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Ambulance className="w-4 h-4 text-rose-700" />
                        Hospital Referral & Emergency Medical Transfers
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Statutory tracking for hospital admissions, physician treatments, and parent notification on departure & return.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsAddReferralOpen(true)}
                      className="px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Create Hospital Referral
                    </button>
                  </div>

                  {/* Referrals Cards List */}
                  <div className="space-y-4">
                    {hospitalReferrals.filter((h) => h.studentId === student.id).length > 0 ? (
                      hospitalReferrals
                        .filter((h) => h.studentId === student.id)
                        .map((ref) => (
                          <div
                            key={ref.id}
                            className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                              <div className="flex items-center gap-2">
                                <Building className="w-4 h-4 text-slate-700" />
                                <strong className="text-sm text-slate-900">{ref.hospitalName}</strong>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                  {ref.status}
                                </span>
                              </div>
                              <span className="text-xs text-slate-500 font-mono">
                                Transfer Time: {ref.dateTime}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div className="space-y-1.5">
                                <div>
                                  <span className="font-semibold text-slate-700">Accompanying Staff: </span>
                                  <span className="text-slate-900">{ref.accompanyingStaff}</span>
                                </div>
                                <div>
                                  <span className="font-semibold text-slate-700">Clinical Diagnosis: </span>
                                  <span className="text-slate-900 font-medium">{ref.diagnosis}</span>
                                </div>
                                <div>
                                  <span className="font-semibold text-slate-700">Treatment Rendered: </span>
                                  <span className="text-slate-900">{ref.treatment}</span>
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <div>
                                  <span className="font-semibold text-slate-700">Prescribed Medication: </span>
                                  <span className="text-slate-900">{ref.medication}</span>
                                </div>
                                <div>
                                  <span className="font-semibold text-slate-700">Follow-up Review Date: </span>
                                  <span className="text-emerald-800 font-bold font-mono">{ref.followUpDate}</span>
                                </div>
                              </div>
                            </div>

                            {/* Dual Parental Notification Status & Action Buttons */}
                            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                              <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-slate-700">Departure Alert:</span>
                                  {ref.parentNotifiedOnReferral ? (
                                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      Sent ({ref.referralNotificationTimestamp})
                                    </span>
                                  ) : (
                                    <span className="text-amber-700 font-medium">Pending Notification</span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-slate-700">Return to School Alert:</span>
                                  {ref.parentNotifiedOnReturn ? (
                                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      Sent ({ref.returnNotificationTimestamp})
                                    </span>
                                  ) : (
                                    <span className="text-slate-500 font-medium">Awaiting Hospital Discharge</span>
                                  )}
                                </div>
                              </div>

                              {!ref.parentNotifiedOnReturn && (
                                <button
                                  onClick={() => handleNotifyReferralReturn(ref.id)}
                                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
                                >
                                  <Send className="w-3 h-3" />
                                  Notify Parents on Return
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                        No hospital referral cases recorded for {student.name}.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab: Complete Health History View */}
            {activeSubTab === 'health_history' && (
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <History className="w-4 h-4 text-emerald-700" />
                        Comprehensive Health & Clinical History: {student.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Chronological record of all dispensations, vital signs, emergency referrals, and clinical notes.
                      </p>
                    </div>

                    <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                      Center: 20401823 &bull; Adm: {student.admissionNo}
                    </span>
                  </div>

                  {/* Summary Metric Ribbon */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block">Blood Group:</span>
                      <strong className="text-slate-900 text-sm font-bold">{student.bloodGroup || 'O+'}</strong>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block">Total Sickness Visits:</span>
                      <strong className="text-rose-700 text-sm font-bold">
                        {sicknessRecords.filter((s) => s.studentId === student.id).length}
                      </strong>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block">Hospital Referrals:</span>
                      <strong className="text-amber-800 text-sm font-bold">
                        {hospitalReferrals.filter((h) => h.studentId === student.id).length}
                      </strong>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 block">Residence Status:</span>
                      <strong className="text-purple-800 text-sm font-bold">
                        {student.isBoarder ? 'Boarder (Hostel B)' : 'Day Scholar'}
                      </strong>
                    </div>
                  </div>

                  {/* Chronological Timeline */}
                  <div className="space-y-3 pt-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Past Clinical Events Timeline
                    </h5>

                    <div className="relative pl-6 space-y-4 border-l-2 border-slate-200">
                      {/* Referrals in History */}
                      {hospitalReferrals
                        .filter((h) => h.studentId === student.id)
                        .map((ref) => (
                          <div key={ref.id} className="relative space-y-1 text-xs">
                            <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-rose-600 border-2 border-white" />
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-rose-900">
                                Hospital Referral &bull; {ref.hospitalName}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">{ref.dateTime}</span>
                            </div>
                            <p className="text-slate-700 bg-rose-50/60 p-2.5 rounded-lg border border-rose-200 leading-relaxed">
                              Diagnosis: <strong>{ref.diagnosis}</strong>. Treatment: {ref.treatment}. Medications: {ref.medication}. Accompanying staff: {ref.accompanyingStaff}.
                            </p>
                          </div>
                        ))}

                      {/* Sicknesses in History */}
                      {sicknessRecords
                        .filter((s) => s.studentId === student.id)
                        .map((sick) => (
                          <div key={sick.id} className="relative space-y-1 text-xs">
                            <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white" />
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">
                                Dispensary Visit &bull; {sick.symptoms}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">{sick.dateTime}</span>
                            </div>
                            <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                              Vitals: <span className="font-semibold text-rose-700">{sick.temperatureVitals}</span>. Action: {sick.actionTaken}. Attended by: {sick.attendingStaff}.
                            </p>
                          </div>
                        ))}

                      {/* Initial Enrollment Baseline */}
                      <div className="relative space-y-1 text-xs">
                        <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white" />
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            Admission Clinical Screening & Baseline Health Form
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">Admission Date</span>
                        </div>
                        <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                          Blood group confirmed {student.bloodGroup || 'O+'}. Allergies noted: {student.medicalAllergies || 'None'}. Full immunizations verified against Kenya Expanded Programme on Immunization (KEPI) schedule.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 2: Portfolio Evidence */}
            {activeSubTab === 'portfolio_evidence' && (
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm border-b border-slate-100 pb-2">
                    <Award className="w-4 h-4" />
                    <span>CBC Portfolio Evidence Uploads (Photos & Project Artifacts)</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Upload photos of learner art projects, science practicals, agriculture models, or certificates.
                    These documents are persisted in Firebase Storage and linked to {student.name}&apos;s profile.
                  </p>
                  <FileUploadZone
                    linkedRecordId={student.id}
                    category="portfolio_evidence"
                    expectedType="image_or_pdf"
                    label="Portfolio Artifacts & Certificate Files"
                    helperText="Images or PDFs up to 5MB"
                  />
                </div>

                {/* Co-Curricular & Clubs Card */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm border-b border-slate-100 pb-2">
                    <Activity className="w-4 h-4" />
                    <span>Co-Curricular, Talent & Club Involvement</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{student.coCurricular}</p>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs">
                    <span className="font-bold text-slate-800 block mb-0.5">Values & Character Conduct:</span>
                    <p className="text-slate-600 leading-relaxed">{student.valuesNotes}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 3: Vaccines & Consents */}
            {activeSubTab === 'consent_vaccines' && (
              <div className="space-y-4">
                {!canAccessSensitiveHealth ? (
                  <div className="p-6 bg-amber-50 border border-amber-300 rounded-xl text-center space-y-2">
                    <Lock className="w-8 h-8 text-amber-600 mx-auto" />
                    <h4 className="font-bold text-amber-900 text-sm">
                      Restricted Access
                    </h4>
                    <p className="text-xs text-amber-800 max-w-md mx-auto">
                      Vaccination charts and parental consent records contain sensitive minor personal data.
                      Authorized roles: <strong>Principal, Admin, Nurse</strong>.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Vaccination Records */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center gap-2 text-teal-800 font-bold text-sm border-b border-slate-100 pb-2">
                        <Syringe className="w-4 h-4 text-teal-700" />
                        <span>Ministry of Health (MoH) Vaccination Records</span>
                      </div>
                      <FileUploadZone
                        linkedRecordId={student.id}
                        category="vaccination_record"
                        expectedType="image_or_pdf"
                        label="Vaccination Card / Immunization Certificate"
                        helperText="Polio, Measles, BCG, HPV certificates (up to 5MB)"
                        isSensitive={true}
                      />
                    </div>

                    {/* Parental Consent Forms */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center gap-2 text-blue-800 font-bold text-sm border-b border-slate-100 pb-2">
                        <ClipboardList className="w-4 h-4 text-blue-700" />
                        <span>Parental Consent Forms & Trip Permissions</span>
                      </div>
                      <FileUploadZone
                        linkedRecordId={student.id}
                        category="consent_form"
                        expectedType="image_or_pdf"
                        label="Signed Parental Consent Documents"
                        helperText="Signed physical forms, school trip waivers (up to 5MB)"
                        isSensitive={true}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Sub-tab 4: Discipline & Guidance Counseling Record */}
            {activeSubTab === 'discipline' && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <ShieldAlert className="w-4 h-4 text-slate-600" />
                    <span>Guidance, Counseling & Discipline Register</span>
                  </div>
                  <button
                    onClick={() => setIsAddIncidentOpen(true)}
                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3 h-3" /> Log Note
                  </button>
                </div>

                {student.disciplineIncidents.length === 0 ? (
                  <div className="p-4 text-center text-xs text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200 font-medium">
                    <CheckCircle2 className="w-4 h-4 inline-block mr-1 text-emerald-600" />
                    Exemplary record. No disciplinary infractions or formal guidance interventions logged.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {student.disciplineIncidents.map((inc) => (
                      <div key={inc.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>{inc.nature}</span>
                          <span className="text-[11px] text-slate-500 font-normal">{inc.date}</span>
                        </div>
                        <p className="text-slate-600">{inc.actionTaken}</p>
                        <div className="text-[10px] text-slate-400">Recorded by: {inc.reportedBy} &bull; Status: {inc.status}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Incident Modal */}
      {isAddIncidentOpen && student && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Log Guidance & Counseling Incident
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Learner: <strong>{student.name}</strong> ({student.admissionNo})
            </p>

            <form onSubmit={handleAddIncident} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nature of Incident / Observation:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Minor lateness or peer conflict"
                  value={incidentForm.nature}
                  onChange={(e) => setIncidentForm({ ...incidentForm, nature: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Action Taken / Counseling Guidance:</label>
                <textarea
                  rows={3}
                  value={incidentForm.actionTaken}
                  onChange={(e) => setIncidentForm({ ...incidentForm, actionTaken: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Staff Member / Appraiser:</label>
                <input
                  type="text"
                  value={incidentForm.reportedBy}
                  onChange={(e) => setIncidentForm({ ...incidentForm, reportedBy: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddIncidentOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Save Incident Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Sickness Modal */}
      {isAddSicknessOpen && student && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Record Dispensary / Sanatorium Visit
                </h3>
              </div>
              <button
                onClick={() => setIsAddSicknessOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Learner: <strong>{student.name}</strong> ({student.admissionNo} &bull; {student.grade})
            </p>

            <form onSubmit={handleAddSickness} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Reported Symptoms & Onset:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Elevated fever, severe headache, abdominal discomfort"
                  value={sicknessForm.symptoms}
                  onChange={(e) => setSicknessForm({ ...sicknessForm, symptoms: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Temperature & Clinical Vitals:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Temp: 38.4°C, BP: 110/75, Pulse: 84 bpm"
                  value={sicknessForm.temperatureVitals}
                  onChange={(e) => setSicknessForm({ ...sicknessForm, temperatureVitals: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Action Taken, Triage & First Aid / Meds:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g., Oral paracetamol, oral rehydration solution, admitted to bed bay 3 for 2 hours monitoring"
                  value={sicknessForm.actionTaken}
                  onChange={(e) => setSicknessForm({ ...sicknessForm, actionTaken: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Attending Nurse / Staff:</label>
                  <input
                    type="text"
                    required
                    value={sicknessForm.attendingStaff}
                    onChange={(e) => setSicknessForm({ ...sicknessForm, attendingStaff: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Residence Status:</label>
                  <select
                    value={sicknessForm.isBoarder ? 'boarder' : 'day'}
                    onChange={(e) => setSicknessForm({ ...sicknessForm, isBoarder: e.target.value === 'boarder' })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 bg-white"
                  >
                    <option value="boarder">Boarding Learner (Hostel)</option>
                    <option value="day">Day Scholar</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900">
                For boarding students, parental notification is recommended if symptoms persist or temperature exceeds 38.0°C.
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddSicknessOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Save Sickness Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hospital Referral Modal */}
      {isAddReferralOpen && student && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <Ambulance className="w-4 h-4 text-rose-700" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Create Hospital Referral & Transfer
                </h3>
              </div>
              <button
                onClick={() => setIsAddReferralOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Learner: <strong>{student.name}</strong> ({student.admissionNo}) &bull; Primary Contact: {student.guardianPhone}
            </p>

            <form onSubmit={handleAddHospitalReferral} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Referral Hospital / Facility:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Limuru Sub-County Level 4 Hospital / Tigoni Hospital"
                  value={referralForm.hospitalName}
                  onChange={(e) => setReferralForm({ ...referralForm, hospitalName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-rose-500 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Accompanying Staff Member(s):</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sister Beatrice (Nurse) & Mr. Patrick Wanjala (Deputy Principal)"
                  value={referralForm.accompanyingStaff}
                  onChange={(e) => setReferralForm({ ...referralForm, accompanyingStaff: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Working Diagnosis / Reason for Transfer:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep laceration requiring suturing, high unremitting fever, acute asthma exacerbation"
                  value={referralForm.diagnosis}
                  onChange={(e) => setReferralForm({ ...referralForm, diagnosis: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-rose-500 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Treatment / Procedures Ordered:</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Wound debridement, X-Ray left ankle, IV antibiotics"
                  value={referralForm.treatment}
                  onChange={(e) => setReferralForm({ ...referralForm, treatment: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Prescribed Medication:</label>
                  <input
                    type="text"
                    required
                    value={referralForm.medication}
                    onChange={(e) => setReferralForm({ ...referralForm, medication: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Follow-up Review Date:</label>
                  <input
                    type="date"
                    required
                    value={referralForm.followUpDate}
                    onChange={(e) => setReferralForm({ ...referralForm, followUpDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-[11px] text-rose-950">
                <strong>Statutory Notification:</strong> Saving this referral will automatically dispatch an emergency departure SMS & in-app alert to both registered guardians ({student.guardianPhone} and secondary contact).
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddReferralOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Dispatch Referral & Notify Parents
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Boarding Parent Notification Modal */}
      {isNotifyBoardingOpen && activeSicknessForNotify && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Notify Boarding Parents / Guardians
                </h3>
              </div>
              <button
                onClick={() => setIsNotifyBoardingOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Learner: <strong>{activeSicknessForNotify.studentName}</strong> ({activeSicknessForNotify.admissionNo})
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="text-slate-500 font-semibold">Incident Details:</div>
                <div className="font-medium text-slate-800">{activeSicknessForNotify.symptoms}</div>
                <div className="text-rose-700 font-semibold">{activeSicknessForNotify.temperatureVitals}</div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Notification Channel:</label>
                <select
                  value={notifyChannel}
                  onChange={(e) => setNotifyChannel(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 bg-white"
                >
                  <option value="All Channels (SMS, Email & In-App)">All Channels (SMS, Email & In-App)</option>
                  <option value="SMS">SMS Gateway Only (Safaricom)</option>
                  <option value="Email">Email Only</option>
                  <option value="In-App">Parent Portal In-App Notification</option>
                </select>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-emerald-950 leading-relaxed">
                <strong>Simulated Dispatch:</strong> Alert will be sent to Parent 1 ({student.guardianPhone}) and Parent 2 ({student.secondGuardianPhone || '0722334455'}) with attending nurse Sister Beatrice&apos;s direct line.
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNotifyBoardingOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDispatchBoardingNotification(activeSicknessForNotify)}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Parent Notification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
