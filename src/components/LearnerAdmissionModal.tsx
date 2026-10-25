/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  UserPlus,
  X,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Building,
  HeartPulse,
  Award,
} from 'lucide-react';
import { Learner, GradeLevel, VoteHead } from '../types/school';
import { ALL_GRADES, VOTE_HEADS } from '../data/mockSchoolData';
import { exportToExcel } from '../utils/excelExport';

interface Props {
  onAddLearner: (learner: Learner) => void;
  onAddBulkLearners: (learners: Learner[]) => void;
  onClose: () => void;
  existingCount: number;
}

export function LearnerAdmissionModal({
  onAddLearner,
  onAddBulkLearners,
  onClose,
  existingCount,
}: Props) {
  const [mode, setMode] = useState<'single' | 'excel'>('single');

  // Single learner form
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male' as 'Male' | 'Female',
    grade: 'Grade 1' as GradeLevel,
    stream: '1 Acacia',
    dob: '2019-01-01',
    birthCertNo: '',
    nemisUpi: '',
    assessmentNo: '',
    guardianName: '',
    guardianPhone: '+254 7',
    guardianEmail: '',
    bloodGroup: 'O+',
    medicalAllergies: '',
    coCurricular: '',
    termFee: 16500,
  });

  // Bulk Excel parsing
  const [parsedLearners, setParsedLearners] = useState<Learner[]>([]);
  const [bulkFileName, setBulkFileName] = useState<string>('');

  // Handle grade change and auto-set stream and default fee
  const handleGradeChange = (newGrade: GradeLevel) => {
    let defaultStream = '1 Acacia';
    let defaultFee = 16500;
    if (newGrade === 'Grade 1') { defaultStream = '1 Acacia'; defaultFee = 16500; }
    else if (newGrade === 'Grade 2') { defaultStream = '2 Baobab'; defaultFee = 16500; }
    else if (newGrade === 'Grade 3') { defaultStream = '3 Jacaranda'; defaultFee = 16500; }
    else if (newGrade === 'Grade 4') { defaultStream = '4 Cedar'; defaultFee = 20000; }
    else if (newGrade === 'Grade 5') { defaultStream = '5 Elgon'; defaultFee = 20000; }
    else if (newGrade === 'Grade 6') { defaultStream = '6 Mugumo'; defaultFee = 22000; }
    else if (newGrade === 'Grade 7') { defaultStream = '7 Amboseli'; defaultFee = 28500; }
    else if (newGrade === 'Grade 8') { defaultStream = '8 Mara'; defaultFee = 28500; }
    else if (newGrade === 'Grade 9') { defaultStream = '9 Turkana'; defaultFee = 28500; }

    setFormData((prev) => ({
      ...prev,
      grade: newGrade,
      stream: defaultStream,
      termFee: defaultFee,
    }));
  };

  const createVoteheadBreakdown = (total: number): Record<VoteHead, { allocated: number; paid: number }> => {
    const tuition = Math.round(total * 0.32);
    const ops = Math.round(total * 0.22);
    const boarding = Math.round(total * 0.26);
    const activity = Math.round(total * 0.08);
    const pta = Math.round(total * 0.06);
    const exam = total - (tuition + ops + boarding + activity + pta);

    return {
      'Tuition & Learning Materials': { allocated: tuition, paid: 0 },
      'Operations & Maintenance': { allocated: ops, paid: 0 },
      'Boarding & Meals': { allocated: boarding, paid: 0 },
      'Activity & Co-Curricular': { allocated: activity, paid: 0 },
      'PTA Development': { allocated: pta, paid: 0 },
      'Exam & Assessment': { allocated: exam, paid: 0 },
    };
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const nextIndex = existingCount + 101;
    const admNo = `LMS/2026/0${nextIndex}`;
    const generatedUpi = formData.nemisUpi || `UPI-${Math.floor(1000000 + Math.random() * 9000000)}-K`;
    const generatedKnec =
      formData.assessmentNo ||
      (formData.grade.includes('7') || formData.grade.includes('8') || formData.grade.includes('9')
        ? `KNEC/JSS/2026/${Math.floor(1000 + Math.random() * 9000)}`
        : `KNEC/PRI/2026/${Math.floor(1000 + Math.random() * 9000)}`);

    const newLearner: Learner = {
      id: `std_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      admissionNo: admNo,
      nemisUpi: generatedUpi,
      kemisStatus: 'Verified',
      assessmentNo: generatedKnec,
      birthCertNo: formData.birthCertNo || `B/CERT/${Math.floor(1000000 + Math.random() * 9000000)}`,
      name: formData.name.trim(),
      gender: formData.gender,
      grade: formData.grade,
      stream: formData.stream,
      dob: formData.dob,
      guardianName: formData.guardianName.trim() || 'Parent/Guardian',
      guardianPhone: formData.guardianPhone.trim(),
      guardianEmail: formData.guardianEmail.trim(),
      bloodGroup: formData.bloodGroup,
      medicalAllergies: formData.medicalAllergies.trim(),
      coCurricular: formData.coCurricular.trim() || 'Scouting, Athletics, Music Choir',
      disciplineIncidents: [],
      fees: {
        totalTermFee: formData.termFee,
        paidAmount: 0,
        balance: formData.termFee,
        status: 'Defaulter',
        voteheadBreakdown: createVoteheadBreakdown(formData.termFee),
        bursaryApplied: 0,
        capitationReceived: formData.grade.includes('7') || formData.grade.includes('8') || formData.grade.includes('9') ? 4200 : 1420,
      },
      assessments: {},
      competencies: {
        communication: 4,
        criticalThinking: 4,
        digitalLiteracy: 4,
        citizenship: 4,
        creativity: 4,
        selfEfficacy: 4,
      },
      valuesNotes: 'Newly admitted learner to Limuru Model School. Enrolled into NEMIS register.',
      attendancePercent: 100,
    };

    onAddLearner(newLearner);
    onClose();
  };

  const handleDownloadAdmissionTemplate = () => {
    const templateSample = [
      {
        name: 'Faith Wangari Mburu',
        gender: 'Female',
        grade: 'Grade 1',
        stream: '1 Acacia',
        dob: '2019-05-10',
        birthCertNo: 'B/CERT/1948201',
        guardianName: 'Peter Mburu (Father)',
        guardianPhone: '+254 712 345 678',
        termFee: 16500,
      },
      {
        name: 'Victor Kipchoge Kemboi',
        gender: 'Male',
        grade: 'Grade 7',
        stream: '7 Amboseli',
        dob: '2013-09-22',
        birthCertNo: 'B/CERT/1492041',
        guardianName: 'Susan Kemboi (Mother)',
        guardianPhone: '+254 722 987 654',
        termFee: 28500,
      },
    ];

    exportToExcel(
      'Limuru_Model_Learner_Admission_Template',
      templateSample,
      [
        { header: 'Full Name', key: 'name' },
        { header: 'Gender (Male/Female)', key: 'gender' },
        { header: 'Grade (Grade 1 to 9)', key: 'grade' },
        { header: 'Stream', key: 'stream' },
        { header: 'Date of Birth (YYYY-MM-DD)', key: 'dob' },
        { header: 'Birth Certificate No', key: 'birthCertNo' },
        { header: 'Guardian Name', key: 'guardianName' },
        { header: 'Guardian Phone', key: 'guardianPhone' },
        { header: 'Term Fee (KES)', key: 'termFee' },
      ]
    );
  };

  const handleUploadBulkCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) return;

      const learners: Learner[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(/[,;\t]/).map((c) => c.replace(/^["']|["']$/g, '').trim());
        if (parts.length >= 3 && parts[0].length > 0) {
          const name = parts[0];
          const gender = parts[1]?.toLowerCase().includes('f') ? 'Female' : 'Male';
          const grade = (ALL_GRADES.find((g) => g.toLowerCase() === parts[2]?.toLowerCase()) || 'Grade 1') as GradeLevel;
          const stream = parts[3] || `${grade.replace('Grade ', '')} Standard`;
          const dob = parts[4] || '2018-01-01';
          const bcert = parts[5] || `B/CERT/${Math.floor(1000000 + Math.random() * 9000000)}`;
          const gName = parts[6] || 'Parent / Guardian';
          const gPhone = parts[7] || '+254 700 000 000';
          const fee = Number(parts[8]) || (grade.includes('7') || grade.includes('8') || grade.includes('9') ? 28500 : 16500);

          const idx = existingCount + i + 100;
          learners.push({
            id: `std_bulk_${Date.now()}_${i}`,
            admissionNo: `LMS/2026/0${idx}`,
            nemisUpi: `UPI-${Math.floor(1000000 + Math.random() * 9000000)}-K`,
            kemisStatus: 'Verified',
            assessmentNo: `KNEC/${grade.includes('7') || grade.includes('8') || grade.includes('9') ? 'JSS' : 'PRI'}/2026/${Math.floor(1000 + Math.random() * 9000)}`,
            birthCertNo: bcert,
            name,
            gender,
            grade,
            stream,
            dob,
            guardianName: gName,
            guardianPhone: gPhone,
            coCurricular: 'Clubs & Sports',
            disciplineIncidents: [],
            fees: {
              totalTermFee: fee,
              paidAmount: 0,
              balance: fee,
              status: 'Defaulter',
              voteheadBreakdown: createVoteheadBreakdown(fee),
              bursaryApplied: 0,
              capitationReceived: 1420,
            },
            assessments: {},
            competencies: { communication: 4, criticalThinking: 4, digitalLiteracy: 4, citizenship: 4, creativity: 4, selfEfficacy: 4 },
            valuesNotes: 'Enrolled via Limuru Model School bulk registration.',
            attendancePercent: 100,
          });
        }
      }
      setParsedLearners(learners);
    };
    reader.readAsText(file);
  };

  const handleApplyBulk = () => {
    if (parsedLearners.length === 0) return;
    onAddBulkLearners(parsedLearners);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 sm:p-7 border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Learner Admission & NEMIS Enrollment
              </h3>
              <p className="text-xs text-slate-500">
                Limuru Model Comprehensive School · Grades 1 to 9 (Lower Primary, Upper Primary & JSS)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="mt-4 flex border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setMode('single')}
            className={`py-2 px-4 border-b-2 transition-colors ${
              mode === 'single'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Individual Learner Admission
          </button>
          <button
            onClick={() => setMode('excel')}
            className={`py-2 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              mode === 'excel'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Bulk Excel Admission (.csv)
          </button>
        </div>

        {mode === 'single' ? (
          <form onSubmit={handleSingleSubmit} className="mt-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Learner Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Victor Kipchoge Kemboi"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Gender *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Grade Level (Grade 1 - 9) *</label>
                <select
                  value={formData.grade}
                  onChange={(e) => handleGradeChange(e.target.value as GradeLevel)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-semibold text-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {ALL_GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g} {g.includes('1') || g.includes('2') || g.includes('3') ? '(Lower Primary)' : g.includes('4') || g.includes('5') || g.includes('6') ? '(Upper Primary)' : '(Junior Secondary)'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Assigned Stream *</label>
                <input
                  type="text"
                  required
                  value={formData.stream}
                  onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Birth Certificate Number</label>
                <input
                  type="text"
                  placeholder="e.g. B/CERT/1948201"
                  value={formData.birthCertNo}
                  onChange={(e) => setFormData({ ...formData, birthCertNo: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Guardian Name & Relation *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Susan Kemboi (Mother)"
                  value={formData.guardianName}
                  onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Safaricom Mobile (for SMS Alerts & M-Pesa) *</label>
                <input
                  type="tel"
                  required
                  placeholder="+254 7XX XXX XXX"
                  value={formData.guardianPhone}
                  onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Term Fee Amount (KES)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.termFee}
                  onChange={(e) => setFormData({ ...formData, termFee: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-bold tabular-nums text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Blood Group & Medical Notes</label>
                <input
                  type="text"
                  placeholder="e.g. O+, Asthmatic inhaler"
                  value={formData.medicalAllergies}
                  onChange={(e) => setFormData({ ...formData, medicalAllergies: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded border border-emerald-200 text-[11px] text-emerald-900">
              <strong>Automatic MoE NEMIS Registration:</strong> An official Admission Number (e.g. <code>LMS/2026/0{existingCount + 101}</code>) and Unique Personal Identifier (UPI) will be provisioned.
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold shadow-xs transition-colors"
              >
                Admit Learner & Register NEMIS
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-5 space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900">Download Admission Excel Template</h4>
                  <p className="text-[11px] text-slate-500">
                    Template with pre-set headers: Full Name, Gender, Grade, Stream, DOB, Guardian Phone, Term Fee
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadAdmissionTemplate}
                  className="px-3 py-1.5 bg-white border border-emerald-600 text-emerald-800 hover:bg-emerald-50 rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                  Download Template (.csv)
                </button>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <label className="font-semibold text-slate-800 block mb-1.5">
                  Upload Filled Admission Spreadsheet (.csv):
                </label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors">
                    <Upload className="w-4 h-4" />
                    Select Spreadsheet File
                    <input
                      type="file"
                      accept=".csv,.txt,.tsv"
                      onChange={handleUploadBulkCsv}
                      className="hidden"
                    />
                  </label>
                  {bulkFileName && (
                    <span className="text-slate-600 font-medium font-mono text-[11px]">
                      {bulkFileName} ({parsedLearners.length} learners parsed)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {parsedLearners.length > 0 && (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-900 font-semibold flex items-center justify-between">
                  <span>Ready to enroll {parsedLearners.length} learners:</span>
                  <button
                    onClick={handleApplyBulk}
                    className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold"
                  >
                    Confirm & Enroll All
                  </button>
                </div>
                <div className="max-h-52 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2">Name</th>
                        <th className="p-2">Grade</th>
                        <th className="p-2">Guardian Phone</th>
                        <th className="p-2 text-right">Term Fee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedLearners.map((std, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-semibold text-slate-900">{std.name}</td>
                          <td className="p-2 text-slate-700">{std.grade} ({std.stream})</td>
                          <td className="p-2 font-mono text-slate-600">{std.guardianPhone}</td>
                          <td className="p-2 text-right font-bold text-emerald-800">KES {std.fees.totalTermFee.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
