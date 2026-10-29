/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useId } from 'react';
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
  Image as ImageIcon,
  FileText,
  RefreshCw,
  Info,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Learner, GradeLevel, VoteHead } from '../types/school';
import { ALL_GRADES, VOTE_HEADS } from '../data/mockSchoolData';
import { exportToExcel } from '../utils/excelExport';
import { FileUploadZone } from './FileUploadZone';
import { uploadFileWithProgress } from '../services/storageService';
import { useAuth } from '../context/AuthContext';

interface Props {
  onAddLearner: (learner: Learner) => void;
  onAddBulkLearners: (learners: Learner[]) => void;
  onClose: () => void;
  existingCount: number;
  existingLearners?: Learner[];
}

interface ParsedBulkRow {
  rowNumber: number;
  name: string;
  gender: 'Male' | 'Female';
  grade: GradeLevel;
  stream: string;
  dob: string;
  birthCertNo: string;
  admissionNo?: string;
  nemisUpi?: string;
  guardianName: string;
  guardianPhone: string;
  termFee: number;
  isExistingMatch: boolean;
  matchedId?: string;
  errors: string[];
}

export function LearnerAdmissionModal({
  onAddLearner,
  onAddBulkLearners,
  onClose,
  existingCount,
  existingLearners = [],
}: Props) {
  const { currentUser } = useAuth();
  const [mode, setMode] = useState<'single' | 'excel'>('single');
  const tempRecordId = useState(() => `learner_temp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`)[0];

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
    photoUrl: '',
  });

  // Bulk Excel parsing
  const [bulkParsedRows, setBulkParsedRows] = useState<ParsedBulkRow[]>([]);
  const [bulkFileName, setBulkFileName] = useState<string>('');
  const [bulkErrorSummary, setBulkErrorSummary] = useState<string[]>([]);
  const [bulkSpreadsheetUploading, setBulkSpreadsheetUploading] = useState<boolean>(false);
  const [bulkUploadProgress, setBulkUploadProgress] = useState<number>(0);

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
      id: tempRecordId,
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
      photoUrl: formData.photoUrl || undefined,
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
        'Admission No (Optional)': 'LMS/2026/0101',
        'NEMIS UPI (Optional)': 'UPI-1948201-K',
        'Full Name': 'Faith Wangari Mburu',
        'Gender (Male/Female)': 'Female',
        'Grade (Grade 1 to 9)': 'Grade 1',
        'Stream': '1 Acacia',
        'Date of Birth (YYYY-MM-DD)': '2019-05-10',
        'Birth Certificate No': 'B/CERT/1948201',
        'Guardian Name': 'Peter Mburu (Father)',
        'Guardian Phone': '+254 712 345 678',
        'Term Fee (KES)': 16500,
      },
      {
        'Admission No (Optional)': '',
        'NEMIS UPI (Optional)': '',
        'Full Name': 'Victor Kipchoge Kemboi',
        'Gender (Male/Female)': 'Male',
        'Grade (Grade 7 to 9)': 'Grade 7',
        'Stream': '7 Amboseli',
        'Date of Birth (YYYY-MM-DD)': '2013-09-22',
        'Birth Certificate No': 'B/CERT/1492041',
        'Guardian Name': 'Susan Kemboi (Mother)',
        'Guardian Phone': '+254 722 987 654',
        'Term Fee (KES)': 28500,
      },
    ];

    exportToExcel(
      'Limuru_Model_Learner_Admission_Template',
      templateSample,
      [
        { header: 'Admission No (Optional)', key: 'Admission No (Optional)' },
        { header: 'NEMIS UPI (Optional)', key: 'NEMIS UPI (Optional)' },
        { header: 'Full Name', key: 'Full Name' },
        { header: 'Gender (Male/Female)', key: 'Gender (Male/Female)' },
        { header: 'Grade (Grade 1 to 9)', key: 'Grade (Grade 1 to 9)' },
        { header: 'Stream', key: 'Stream' },
        { header: 'Date of Birth (YYYY-MM-DD)', key: 'Date of Birth (YYYY-MM-DD)' },
        { header: 'Birth Certificate No', key: 'Birth Certificate No' },
        { header: 'Guardian Name', key: 'Guardian Name' },
        { header: 'Guardian Phone', key: 'Guardian Phone' },
        { header: 'Term Fee (KES)', key: 'Term Fee (KES)' },
      ]
    );
  };

  const handleUploadSpreadsheet = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkFileName(file.name);
    setBulkErrorSummary([]);
    setBulkSpreadsheetUploading(true);
    setBulkUploadProgress(10);

    try {
      // 1. Persist the uploaded Excel file to Firebase Storage / Persistent storage
      const uploader = currentUser
        ? { uid: currentUser.uid, fullName: currentUser.fullName, role: currentUser.role }
        : { uid: 'admin_sys', fullName: 'School Administrator', role: 'admin' };

      await uploadFileWithProgress({
        file,
        category: 'admission_document',
        linkedRecordId: 'bulk_admission_batch',
        linkedRecordType: 'admission_document',
        user: uploader,
        notes: `Bulk Learner Admission Spreadsheet: ${file.name}`,
        expectedType: 'spreadsheet',
        onProgress: (p) => setBulkUploadProgress(p),
      });

      // 2. Parse Spreadsheet with xlsx
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

      if (rawRows.length === 0) {
        setBulkErrorSummary(['The uploaded spreadsheet is empty or has no readable rows.']);
        setBulkSpreadsheetUploading(false);
        return;
      }

      const parsed: ParsedBulkRow[] = [];
      const errorsList: string[] = [];

      rawRows.forEach((row, index) => {
        const rowNum = index + 2; // header is row 1
        const rowErrors: string[] = [];

        // Flexible header extraction
        const name = (row['Full Name'] || row['Name'] || row['name'] || '').toString().trim();
        const rawGender = (row['Gender (Male/Female)'] || row['Gender'] || row['gender'] || '').toString().trim();
        const rawGrade = (row['Grade (Grade 1 to 9)'] || row['Grade'] || row['grade'] || '').toString().trim();
        const stream = (row['Stream'] || row['stream'] || '').toString().trim();
        const dob = (row['Date of Birth (YYYY-MM-DD)'] || row['DOB'] || row['dob'] || '2018-01-01').toString().trim();
        const bcert = (row['Birth Certificate No'] || row['BirthCert'] || '').toString().trim();
        const admNo = (row['Admission No (Optional)'] || row['AdmissionNo'] || row['AdmNo'] || '').toString().trim();
        const nemis = (row['NEMIS UPI (Optional)'] || row['NEMIS'] || row['UPI'] || '').toString().trim();
        const gName = (row['Guardian Name'] || row['Guardian'] || 'Parent / Guardian').toString().trim();
        const gPhone = (row['Guardian Phone'] || row['Phone'] || '').toString().trim();
        const rawFee = row['Term Fee (KES)'] || row['TermFee'] || row['Fee'];

        if (!name) {
          rowErrors.push('Missing Full Name');
        }

        const gender: 'Male' | 'Female' = rawGender.toLowerCase().startsWith('f') ? 'Female' : 'Male';

        // Match grade
        const matchedGrade = ALL_GRADES.find(
          (g) => g.toLowerCase() === rawGrade.toLowerCase() || g.replace('Grade ', '').trim() === rawGrade
        ) as GradeLevel | undefined;

        if (!matchedGrade) {
          rowErrors.push(`Unrecognized grade: '${rawGrade}'. Must be Grade 1 to 9.`);
        }

        const validGrade: GradeLevel = matchedGrade || 'Grade 1';
        const feeNumber = Number(rawFee) || (validGrade.includes('7') || validGrade.includes('8') || validGrade.includes('9') ? 28500 : 16500);

        // Duplicate / Existing Match detection
        const existingMatch = existingLearners.find((ex) => {
          if (admNo && ex.admissionNo.toLowerCase() === admNo.toLowerCase()) return true;
          if (nemis && ex.nemisUpi.toLowerCase() === nemis.toLowerCase()) return true;
          if (name && ex.name.toLowerCase() === name.toLowerCase() && ex.grade === validGrade) return true;
          return false;
        });

        if (rowErrors.length > 0) {
          errorsList.push(`Row ${rowNum} (${name || 'Unnamed'}): ${rowErrors.join(', ')}`);
        }

        parsed.push({
          rowNumber: rowNum,
          name,
          gender,
          grade: validGrade,
          stream: stream || `${validGrade.replace('Grade ', '')} Standard`,
          dob,
          birthCertNo: bcert || `B/CERT/${Math.floor(1000000 + Math.random() * 9000000)}`,
          admissionNo: admNo || existingMatch?.admissionNo,
          nemisUpi: nemis || existingMatch?.nemisUpi,
          guardianName: gName,
          guardianPhone: gPhone || '+254 700 000 000',
          termFee: feeNumber,
          isExistingMatch: !!existingMatch,
          matchedId: existingMatch?.id,
          errors: rowErrors,
        });
      });

      setBulkParsedRows(parsed);
      setBulkErrorSummary(errorsList);
    } catch (err: any) {
      setBulkErrorSummary([`Spreadsheet processing error: ${err.message || 'Invalid format'}`]);
    } finally {
      setBulkSpreadsheetUploading(false);
    }
  };

  const handleApplyBulk = () => {
    const validRows = bulkParsedRows.filter((r) => r.errors.length === 0);
    if (validRows.length === 0) return;

    const learnersToApply: Learner[] = validRows.map((row, i) => {
      const idx = existingCount + i + 101;
      const finalAdm = row.admissionNo || `LMS/2026/0${idx}`;
      const finalUpi = row.nemisUpi || `UPI-${Math.floor(1000000 + Math.random() * 9000000)}-K`;
      const isJss = row.grade.includes('7') || row.grade.includes('8') || row.grade.includes('9');

      return {
        id: row.matchedId || `std_bulk_${Date.now()}_${i}`,
        admissionNo: finalAdm,
        nemisUpi: finalUpi,
        kemisStatus: 'Verified',
        assessmentNo: `KNEC/${isJss ? 'JSS' : 'PRI'}/2026/${Math.floor(1000 + Math.random() * 9000)}`,
        birthCertNo: row.birthCertNo,
        name: row.name,
        gender: row.gender,
        grade: row.grade,
        stream: row.stream,
        dob: row.dob,
        guardianName: row.guardianName,
        guardianPhone: row.guardianPhone,
        coCurricular: 'Clubs & Sports',
        disciplineIncidents: [],
        fees: {
          totalTermFee: row.termFee,
          paidAmount: 0,
          balance: row.termFee,
          status: 'Defaulter',
          voteheadBreakdown: createVoteheadBreakdown(row.termFee),
          bursaryApplied: 0,
          capitationReceived: isJss ? 4200 : 1420,
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
        valuesNotes: row.isExistingMatch
          ? 'Updated existing learner record via verified Excel batch.'
          : 'Enrolled via Limuru Model School bulk registration.',
        attendancePercent: 100,
      };
    });

    onAddBulkLearners(learnersToApply);
    onClose();
  };

  const matchedCount = bulkParsedRows.filter((r) => r.isExistingMatch && r.errors.length === 0).length;
  const newCount = bulkParsedRows.filter((r) => !r.isExistingMatch && r.errors.length === 0).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 text-slate-800 animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Limuru Model Comprehensive School — Learner Admission & NEMIS Registration
              </h3>
              <p className="text-xs text-slate-500">
                Institutional Center No: 20401823 &bull; CBC Grade 1 to 9 Portal &bull; Persistent Storage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-3 mt-4 border-b border-slate-200 pb-3">
          <button
            type="button"
            onClick={() => setMode('single')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              mode === 'single'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Single Learner Admission
          </button>
          <button
            type="button"
            onClick={() => setMode('excel')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              mode === 'excel'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Bulk Excel / CSV Import & Update
          </button>
        </div>

        {mode === 'single' ? (
          <form onSubmit={handleSingleSubmit} className="mt-4 space-y-4">
            {/* Top row: Photo upload + primary info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              {/* Photo Upload Zone */}
              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border border-slate-200">
                {formData.photoUrl ? (
                  <div className="relative mb-2">
                    <img
                      src={formData.photoUrl}
                      alt="Learner"
                      className="w-24 h-24 rounded-full object-cover border-2 border-emerald-600 shadow"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, photoUrl: '' }))}
                      className="absolute -top-1 -right-1 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 mb-2 border-2 border-dashed border-emerald-300">
                    <ImageIcon className="w-8 h-8 text-emerald-600" />
                  </div>
                )}
                <FileUploadZone
                  linkedRecordId={tempRecordId}
                  category="learner_photo"
                  expectedType="image"
                  label="Learner Photo"
                  helperText="JPEG, PNG up to 5MB"
                  compact
                  maxFiles={1}
                  onUploadSuccess={(rec) => setFormData((p) => ({ ...p, photoUrl: rec.downloadUrl }))}
                />
              </div>

              {/* Primary Learner Details */}
              <div className="md:col-span-2 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Learner Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Joy Nduta Macharia"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-600 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-600 outline-hidden"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Grade Level *</label>
                    <select
                      value={formData.grade}
                      onChange={(e) => handleGradeChange(e.target.value as GradeLevel)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-600 outline-hidden"
                    >
                      {ALL_GRADES.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Stream Assigned</label>
                    <input
                      type="text"
                      value={formData.stream}
                      onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-600 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-600 outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Birth Certificate No (Civil Reg)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. B/CERT/2019/88219"
                      value={formData.birthCertNo}
                      onChange={(e) => setFormData({ ...formData, birthCertNo: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-600 outline-hidden font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      NEMIS UPI (Auto-assigned if blank)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UPI-9281744-K"
                      value={formData.nemisUpi}
                      onChange={(e) => setFormData({ ...formData, nemisUpi: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-600 outline-hidden font-mono text-emerald-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Middle: Guardian & Medical */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-emerald-700" /> Guardian & Contacts
                </span>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Guardian Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grace Wanjiku (Mother)"
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-600 outline-hidden"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Guardian Phone *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+254 722 000 000"
                      value={formData.guardianPhone}
                      onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-600 outline-hidden font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Guardian Email
                    </label>
                    <input
                      type="email"
                      placeholder="parent@gmail.com"
                      value={formData.guardianEmail}
                      onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-600 outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Health & Admission Documents */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-600" /> Health & Admission Documents
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-600 outline-hidden"
                    >
                      <option value="O+">O+</option>
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="AB+">AB+</option>
                      <option value="O-">O-</option>
                      <option value="A-">A-</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Term Fee (KES)</label>
                    <input
                      type="number"
                      value={formData.termFee}
                      onChange={(e) => setFormData({ ...formData, termFee: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-bold text-emerald-800 focus:ring-1 focus:ring-emerald-600 outline-hidden"
                    />
                  </div>
                </div>

                {/* Birth Certificate / Admission Document Upload */}
                <FileUploadZone
                  linkedRecordId={tempRecordId}
                  category="birth_certificate"
                  expectedType="image_or_pdf"
                  label="Birth Certificate / Admission PDF"
                  helperText="Persistent PDF or photo (up to 5MB)"
                  compact
                  maxFiles={3}
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
              >
                Admit Learner & Register NEMIS
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-4 space-y-4 text-xs">
            {/* Download Template Banner */}
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  Excel / CSV Bulk Admission & Duplicate Update Engine
                </h4>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Import will <strong>update existing learners</strong> without duplicating (matched by Admission No or NEMIS UPI).
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadAdmissionTemplate}
                className="px-3.5 py-1.5 bg-white border border-emerald-600 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                Download Template (.csv)
              </button>
            </div>

            {/* File Upload Area */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <label className="font-bold text-slate-800 block text-xs">
                Upload Filled Admission Spreadsheet (.xlsx, .xls, .csv):
              </label>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="cursor-pointer px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs inline-flex items-center gap-2 shadow-xs transition-colors shrink-0">
                  <Upload className="w-4 h-4" />
                  {bulkSpreadsheetUploading ? 'Uploading & Parsing...' : 'Select Excel / CSV File'}
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    disabled={bulkSpreadsheetUploading}
                    onChange={handleUploadSpreadsheet}
                    className="hidden"
                  />
                </label>

                {bulkFileName && (
                  <div className="flex items-center gap-2 text-slate-700 font-mono text-[11px]">
                    <span className="font-semibold">{bulkFileName}</span>
                    <span>&bull;</span>
                    <span className="text-emerald-700 font-bold">{bulkParsedRows.length} rows parsed</span>
                  </div>
                )}
              </div>

              {/* Upload Progress */}
              {bulkSpreadsheetUploading && (
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mt-2">
                  <div
                    className="bg-emerald-600 h-2 transition-all duration-200"
                    style={{ width: `${bulkUploadProgress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Error Report Banner */}
            {bulkErrorSummary.length > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  Validation Report ({bulkErrorSummary.length} issue{bulkErrorSummary.length > 1 ? 's' : ''}):
                </div>
                <div className="max-h-24 overflow-y-auto pl-6 text-[11px] space-y-0.5 list-disc">
                  {bulkErrorSummary.map((err, i) => (
                    <div key={i} className="text-rose-700">{err}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Preview Table */}
            {bulkParsedRows.length > 0 && (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="p-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">
                      Parsed Records: {bulkParsedRows.length}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold text-[11px]">
                      {matchedCount} to update
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[11px]">
                      {newCount} new admissions
                    </span>
                  </div>
                  <button
                    onClick={handleApplyBulk}
                    disabled={matchedCount + newCount === 0}
                    className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Confirm & Save Batch ({matchedCount + newCount})
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-200/70 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="p-2">Action</th>
                        <th className="p-2">Name</th>
                        <th className="p-2">Grade / Stream</th>
                        <th className="p-2">Identifier</th>
                        <th className="p-2">Guardian Phone</th>
                        <th className="p-2 text-right">Term Fee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bulkParsedRows.map((row, idx) => (
                        <tr
                          key={idx}
                          className={
                            row.errors.length > 0
                              ? 'bg-rose-50/50'
                              : row.isExistingMatch
                              ? 'bg-blue-50/40 hover:bg-blue-50/70'
                              : 'hover:bg-slate-50'
                          }
                        >
                          <td className="p-2">
                            {row.errors.length > 0 ? (
                              <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded text-[10px] font-bold">
                                Invalid
                              </span>
                            ) : row.isExistingMatch ? (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-bold flex items-center gap-1">
                                <RefreshCw className="w-2.5 h-2.5" /> Update
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" /> New
                              </span>
                            )}
                          </td>
                          <td className="p-2 font-semibold text-slate-900">{row.name}</td>
                          <td className="p-2 text-slate-700">{row.grade} ({row.stream})</td>
                          <td className="p-2 font-mono text-[11px] text-slate-600">
                            {row.admissionNo || row.nemisUpi || 'Auto-generated'}
                          </td>
                          <td className="p-2 font-mono text-slate-600">{row.guardianPhone}</td>
                          <td className="p-2 text-right font-bold text-emerald-800">
                            KES {row.termFee.toLocaleString()}
                          </td>
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
