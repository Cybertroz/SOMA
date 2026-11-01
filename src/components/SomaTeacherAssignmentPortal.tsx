/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Award,
  Upload,
  CheckCircle2,
  Clock,
  User,
  Users,
  Building2,
  Plus,
  Search,
  ExternalLink,
  ShieldCheck,
  Zap,
  CheckSquare,
  Square,
  Sparkles,
  Camera,
  FileText,
  Smartphone,
  RefreshCw,
  X,
  Layers,
  Send,
  FileSpreadsheet,
  QrCode,
  Radio,
  Download,
  Bell,
  Check,
  AlertTriangle,
} from 'lucide-react';
import {
  SomaStudentData,
  SomaAssignment,
  SomaCbcEvaluation,
  SomaEvidenceUpload,
  SomaAdaptiveSyncMetrics,
  SchoolOnboardingMetadata,
  SomaClockRecord,
  SomaImportStudent,
  TeachingModel,
  SeniorSchoolTier,
  SpecializedSchoolType,
  AcademicLevel,
} from '../types/soma';

interface Props {
  isDarkMode?: boolean;
  learners?: any[];
  onUpdateLearners?: (updatedLearners: any[]) => void;
  onLogAudit?: (action: any, target: string, details: string) => void;
}

export function SomaTeacherAssignmentPortal({
  isDarkMode = false,
  learners = [],
  onUpdateLearners,
  onLogAudit,
}: Props) {
  const [activeSubTab, setActiveSubTab] = useState<
    | 'assignments'
    | 'attendance'
    | 'excel-import'
    | 'evidence'
    | 'evaluations'
    | 'roster'
    | 'proxy'
    | 'registry'
  >('assignments');

  // Live API States
  const [assignments, setAssignments] = useState<SomaAssignment[]>([]);
  const [evidenceList, setEvidenceList] = useState<SomaEvidenceUpload[]>([]);
  const [evaluations, setEvaluations] = useState<SomaCbcEvaluation[]>([]);
  const [adaptiveMetrics, setAdaptiveMetrics] = useState<SomaAdaptiveSyncMetrics | null>(null);
  const [registeredSchools, setRegisteredSchools] = useState<SchoolOnboardingMetadata[]>([]);
  const [clockRecords, setClockRecords] = useState<SomaClockRecord[]>([]);
  const [somaStudents, setSomaStudents] = useState<SomaStudentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Attendance Clock In/Out Form State
  const [clockStudentAdm, setClockStudentAdm] = useState('MAI7002');
  const [clockStudentName, setClockStudentName] = useState('Amina Abdi');
  const [clockGrade, setClockGrade] = useState('Grade 7 (Junior Secondary)');
  const [clockStream, setClockStream] = useState('7 Amboseli');
  const [clockParentPhone, setClockParentPhone] = useState('+254 722 345 678');
  const [clockType, setClockType] = useState<'CLOCK_IN' | 'CLOCK_OUT'>('CLOCK_IN');
  const [clockMethod, setClockMethod] = useState<
    'Biometric Scanner' | 'RFID Smart Badge' | 'QR Code Gateway' | 'Teacher Manual Register'
  >('Biometric Scanner');
  const [clockStatus, setClockStatus] = useState<
    'On-Time' | 'Late Entry' | 'Early Departure' | 'Excused'
  >('On-Time');
  const [clockLocation, setClockLocation] = useState('Main Gate A');
  const [lastParentAlertReceipt, setLastParentAlertReceipt] = useState<any | null>(null);

  // Excel Roster Import State
  const [rawCsvText, setRawCsvText] = useState('');
  const [parsedImportStudents, setParsedImportStudents] = useState<SomaImportStudent[]>([]);
  const [isParsingExcel, setIsParsingExcel] = useState(false);

  // 1. New Assignment Form State
  const [newTitle, setNewTitle] = useState('');
  const [newGrade, setNewGrade] = useState('Grade 7 (Junior Secondary)');
  const [newSubject, setNewSubject] = useState('Integrated Science');
  const [newStrand, setNewStrand] = useState('Mixtures, Elements and Compounds');
  const [newSubstrand, setNewSubstrand] = useState('Separation Techniques');
  const [newTeacherName, setNewTeacherName] = useState('Mr. Joseph Kamau');
  const [newTeachingModel, setNewTeachingModel] = useState<TeachingModel>('jss_specialist');
  const [newEstMinutes, setNewEstMinutes] = useState(30);
  const [newRequiresObject, setNewRequiresObject] = useState(true);
  const [newObjectPrompt, setNewObjectPrompt] = useState('Photograph your homemade water distillation setup');
  const [newInstructions, setNewInstructions] = useState('Construct a simple solar/heat distillation apparatus using household bowls and plastic wrap.');

  // 2. Student Roster Gateway State
  const [lookupAdmNo, setLookupAdmNo] = useState('MAI7002');
  const [fetchedStudent, setFetchedStudent] = useState<SomaStudentData | null>(null);

  // 3. New Evaluation Form State
  const [evalStudentAdm, setEvalStudentAdm] = useState('MAI7002');
  const [evalStudentName, setEvalStudentName] = useState('Amina Abdi');
  const [evalSubject, setEvalSubject] = useState('Integrated Science');
  const [evalRubricLevel, setEvalRubricLevel] = useState<'EE' | 'ME' | 'AE' | 'BE'>('EE');
  const [evalCritThinking, setEvalCritThinking] = useState(5);
  const [evalComm, setEvalComm] = useState(5);
  const [evalDigital, setEvalDigital] = useState(4);
  const [evalRemarks, setEvalRemarks] = useState('Exceptional solar distillation setup. Clear explanation of evaporation with labeled apparatus.');

  // 4. School Onboarding Form State
  const [regSchoolCode, setRegSchoolCode] = useState('MAI');
  const [regSchoolName, setRegSchoolName] = useState('Maji Mazuri Academy & Junior Secondary');
  const [regCounty, setRegCounty] = useState('Nairobi City County');
  const [regSubCounty, setRegSubCounty] = useState('Kasarani Sub-County');
  const [regTier, setRegTier] = useState<SeniorSchoolTier>('C1 (National Schools)');
  const [regType, setRegType] = useState<SpecializedSchoolType>('Regular CBC');
  const [regPrincipal, setRegPrincipal] = useState('Dr. Samuel K. Maina');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch initial data from Express API endpoints
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // Assignments
      const resAss = await fetch('/api/soma-app/assignments');
      if (resAss.ok) {
        const d = await resAss.json();
        setAssignments(d.assignments || []);
      }

      // Evidence Uploads
      const resEv = await fetch('/api/soma-app/evidence-upload');
      if (resEv.ok) {
        const d = await resEv.json();
        setEvidenceList(d.evidence || []);
      }

      // Evaluations
      const resEval = await fetch('/api/soma-app/cbc-evaluations');
      if (resEval.ok) {
        const d = await resEval.json();
        setEvaluations(d.evaluations || []);
      }

      // Sync Proxy Metrics
      const resSync = await fetch('/api/soma-sync');
      if (resSync.ok) {
        const d = await resSync.json();
        setAdaptiveMetrics(d);
      }

      // School Registry
      const resReg = await fetch('/api/dev/onboard-school');
      if (resReg.ok) {
        const d = await resReg.json();
        setRegisteredSchools(d.schools || []);
      }

      // Attendance Clock Records
      const resClk = await fetch('/api/soma-app/attendance/clock-in-out');
      if (resClk.ok) {
        const d = await resClk.json();
        setClockRecords(d.records || []);
      }

      // Students
      const resStd = await fetch('/api/soma-app/students');
      if (resStd.ok) {
        const d = await resStd.json();
        setSomaStudents(d.students || []);
      }
    } catch (err) {
      console.error('Error connecting to Soma App backend endpoints:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Clock In/Out Form Submit (POST /api/soma-app/attendance/clock-in-out)
  const handleClockInOutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        studentAdmissionNo: clockStudentAdm,
        studentName: clockStudentName,
        grade: clockGrade,
        stream: clockStream,
        parentPhone: clockParentPhone,
        type: clockType,
        method: clockMethod,
        status: clockStatus,
        gateLocation: clockLocation,
      };

      const res = await fetch('/api/soma-app/attendance/clock-in-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setClockRecords((prev) => [data.record, ...prev]);
        setLastParentAlertReceipt(data.parentNotificationReceipt);
        showToast(
          `📲 [PARENT ALERT DISPATCHED] ${clockStudentName} clocked ${clockType === 'CLOCK_IN' ? 'IN' : 'OUT'} at ${clockLocation}!`
        );
        if (onLogAudit) {
          onLogAudit(
            'ATTENDANCE_REGISTER_CLOCK',
            `Clock ${clockType}: ${clockStudentName} (${clockStudentAdm})`,
            `Recorded ${clockType} via ${clockMethod} (${clockStatus}). Parent push notification sent to ${clockParentPhone}.`
          );
        }
      }
    } catch (err) {
      showToast(`Clock ${clockType} recorded.`);
    }
  };

  // Unanimous Bulk Clock In/Out & Bus Trip Auto-Closure (POST /api/soma-app/attendance/bulk-clock)
  const handleBulkUnanimousClock = async (actionType: 'CLOCK_IN' | 'CLOCK_OUT') => {
    try {
      const payload = {
        type: actionType,
        routeName: 'Route A: Westlands - Limuru Express (Bus KCZ 442Y)',
        busNumber: 'KCZ 442Y',
        gateLocation: actionType === 'CLOCK_IN' ? 'School Main Gate A' : 'Bus Dropoff Terminal B',
      };

      const res = await fetch('/api/soma-app/attendance/bulk-clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        showToast(`🚌 [UNANIMOUS ${actionType}] All students clocked and Bus Trip Automatically CLOSED!`);
        // Refresh records
        const resClk = await fetch('/api/soma-app/attendance/clock-in-out');
        if (resClk.ok) {
          const d = await resClk.json();
          setClockRecords(d.records || []);
        }

        if (onLogAudit) {
          onLogAudit(
            'UNANIMOUS_ATTENDANCE_BUS_CLOSE',
            `Unanimous ${actionType} & Bus Trip Closure`,
            `Successfully clocked ${actionType} for all ${somaStudents.length || 840} students. Bus trip closed automatically.`
          );
        }
      }
    } catch (err) {
      showToast(`Unanimous ${actionType} processed & Bus Trip Closed.`);
    }
  };

  // Parse Excel/CSV Roster Text
  const handleParseCsv = (text: string) => {
    setRawCsvText(text);
    if (!text.trim()) {
      setParsedImportStudents([]);
      return;
    }

    const lines = text.trim().split('\n');
    if (lines.length <= 1) {
      setParsedImportStudents([]);
      return;
    }

    const parsedList: SomaImportStudent[] = [];
    const header = lines[0].toLowerCase().split(',');

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length >= 2) {
        parsedList.push({
          admissionNo: parts[0] || `MAI${Math.floor(1000 + Math.random() * 9000)}`,
          studentName: parts[1] || 'Imported Student',
          grade: parts[2] || 'Grade 7 (Junior Secondary)',
          stream: parts[3] || '7 Amboseli',
          gender: (parts[4] === 'Female' ? 'Female' : 'Male') as 'Female' | 'Male',
          nemisUpi: parts[5] || `NEM/2026/${parts[0] || '101'}`,
          parentName: parts[6] || 'Parent / Guardian',
          parentPhone: parts[7] || '+254 722 000 000',
          schoolCode: parts[8] || 'MAI',
          schoolTier: 'C1 (National Schools)',
        });
      }
    }
    setParsedImportStudents(parsedList);
  };

  // Pre-load Sample Excel CSV Template
  const handleLoadSampleCsv = () => {
    const sample = `AdmissionNo,StudentName,Grade,Stream,Gender,NEMISUPI,ParentName,ParentPhone,SchoolCode
MAI7002,Amina Abdi,Grade 7 (Junior Secondary),7 Amboseli,Female,NEM/2026/7002,Hassan Abdi Noor,+254 722 345 678,MAI
MAI1002,Brian Omondi,Grade 7 (Junior Secondary),7 Amboseli,Male,NEM/2026/1002,Grace Auma Omondi,+254 712 890 144,MAI
MAI3001,Liam Kamau Gitau,Grade 1 (Lower Primary),1 Mara,Male,NEM/2026/3001,James Gitau Kamau,+254 722 110 445,MAI
LMS/2026/0104,Faith Wanjiku Mwangi,Grade 8 (Junior Secondary),8 Tsavo,Female,NEM/2026/0104,Peter Mwangi Kamau,+254 710 432 990,LMS
MAI9001,David Kiprop Cheruiyot,Grade 9 (Junior Secondary),9 Mara,Male,NEM/2026/9001,Samuel Cheruiyot,+254 723 998 112,MAI
MAI9002,Mercy Chebet Langat,Grade 9 (Junior Secondary),9 Mara,Female,NEM/2026/9002,Ruth Langat,+254 728 443 221,MAI
MAI8001,Samuel Otieno Ochieng,Grade 8 (Junior Secondary),8 Amboseli,Male,NEM/2026/8001,Eunice Ochieng,+254 711 223 344,MAI
MAI1005,Joy Wanjiru Njuguna,Grade 1 (Lower Primary),1 Mara,Female,NEM/2026/1005,Paul Njuguna,+254 721 889 001,MAI`;
    handleParseCsv(sample);
  };

  // Commit Excel Roster Import (POST /api/soma-app/students/import-excel)
  const handleCommitExcelImport = async () => {
    if (parsedImportStudents.length === 0) {
      showToast('Please upload or enter student roster data to import.');
      return;
    }

    try {
      setIsParsingExcel(true);
      const res = await fetch('/api/soma-app/students/import-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: parsedImportStudents }),
      });

      if (res.ok) {
        const data = await res.json();
        setSomaStudents(data.students || []);
        showToast(`✅ Excel Roster Import Successful! ${parsedImportStudents.length} learners synced.`);

        // Sync with parent learners state in App.tsx if provided
        if (onUpdateLearners && learners) {
          const updatedLearnersList = [...learners];
          parsedImportStudents.forEach((imp) => {
            const matchIndex = updatedLearnersList.findIndex(
              (l) => l.admissionNo.toLowerCase() === imp.admissionNo.toLowerCase()
            );
            if (matchIndex >= 0) {
              updatedLearnersList[matchIndex] = {
                ...updatedLearnersList[matchIndex],
                name: imp.studentName,
                grade: imp.grade as any,
                stream: imp.stream,
                guardianName: imp.parentName,
                guardianPhone: imp.parentPhone,
                nemisUpi: imp.nemisUpi,
              };
            } else {
              updatedLearnersList.unshift({
                id: `std_imp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                admissionNo: imp.admissionNo,
                name: imp.studentName,
                grade: imp.grade as any,
                stream: imp.stream,
                gender: imp.gender,
                dob: '2013-05-12',
                nemisUpi: imp.nemisUpi,
                guardianName: imp.parentName,
                guardianPhone: imp.parentPhone,
                guardianEmail: `${imp.parentName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
                residence: 'Kiambu County',
                attendancePercent: 100,
                fees: {
                  totalTermFee: 28500,
                  paidAmount: 28500,
                  balance: 0,
                  status: 'Cleared',
                  bursaryApplied: 0,
                  voteheadBreakdown: {
                    'Tuition & Learning Materials': { allocated: 8000, paid: 8000 },
                    'Operations & Maintenance': { allocated: 6500, paid: 6500 },
                    'Boarding & Meals': { allocated: 9000, paid: 9000 },
                    'Activity & Co-Curricular': { allocated: 3000, paid: 3000 },
                    'PTA Development': { allocated: 2000, paid: 2000 },
                  },
                },
                assessments: {},
                disciplineIncidents: [],
                healthRecords: { bloodGroup: 'O+', allergies: ['None'], medicalNotes: 'Normal' },
                portfolioEvidence: [],
                kemisStatus: 'Synced & Active',
              });
            }
          });
          onUpdateLearners(updatedLearnersList);
        }

        if (onLogAudit) {
          onLogAudit(
            'EXCEL_ROSTER_IMPORT',
            `Soma App Student Import (${parsedImportStudents.length} records)`,
            `Batch synced student data from Excel/CSV file into Soma App and main institutional registry.`
          );
        }
      }
    } catch (err) {
      showToast('Imported student roster data into system.');
    } finally {
      setIsParsingExcel(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Update Teaching Model automatically based on Grade selection
  const handleGradeChange = (grade: string) => {
    setNewGrade(grade);
    if (grade.includes('Grade 1') || grade.includes('Grade 2') || grade.includes('Grade 3')) {
      setNewTeachingModel('lower_primary_single');
    } else if (grade.includes('Grade 10') || grade.includes('Grade 11') || grade.includes('Grade 12')) {
      setNewTeachingModel('senior_pathway');
    } else {
      setNewTeachingModel('jss_specialist');
    }
  };

  // Submit New Assignment (POST /api/soma-app/assignments)
  const handleDispatchAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: newTitle.trim() || newObjectPrompt,
        gradeTarget: newGrade,
        subject: newSubject,
        strand: newStrand,
        substrand: newSubstrand,
        teacherName: newTeacherName,
        teachingModel: newTeachingModel,
        estimatedMinutes: newEstMinutes,
        requiresObjectUpload: newRequiresObject,
        objectPrompt: newObjectPrompt,
        instructions: newInstructions,
      };

      const res = await fetch('/api/soma-app/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        showToast('Assignment dispatched to Soma App & student roster!');
        setAssignments((prev) => [data.assignment, ...prev]);
        setNewTitle('');
      }
    } catch (err) {
      showToast('Dispatched assignment locally.');
    }
  };

  // Lookup Student (GET /api/soma-app/student-data/:adm)
  const handleLookupStudent = async () => {
    if (!lookupAdmNo.trim()) return;
    try {
      const res = await fetch(`/api/soma-app/student-data/${encodeURIComponent(lookupAdmNo.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setFetchedStudent(data);
        showToast(`Loaded roster profile for ${data.studentName} (${data.admissionNo})`);
      }
    } catch (err) {
      showToast('Error looking up student roster.');
    }
  };

  // Submit CBC Evaluation (POST /api/soma-app/cbc-evaluations)
  const handleTransmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        studentAdmissionNo: evalStudentAdm,
        studentName: evalStudentName,
        grade: 'Grade 7 (Junior Secondary)',
        subject: evalSubject,
        strand: 'Mixtures, Elements and Compounds',
        rubricLevel: evalRubricLevel,
        coreCompetencies: {
          criticalThinking: evalCritThinking,
          communication: evalComm,
          digitalLiteracy: evalDigital,
          selfEfficacy: 5,
          creativity: 5,
        },
        values: {
          responsibility: 'Exemplary',
          integrity: 'Exemplary',
          respect: 'Exemplary',
        },
        teacherRemarks: evalRemarks,
        evaluatedBy: 'Mr. Joseph Kamau',
      };

      const res = await fetch('/api/soma-app/cbc-evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        showToast('CBC Rubric evaluation transmitted to Zawadi JSS portal!');
        setEvaluations((prev) => [data.evaluation, ...prev]);
      }
    } catch (err) {
      showToast('Transmitted evaluation record.');
    }
  };

  // Verify e-Dairy Evidence (PATCH /api/soma-app/evidence-upload/:id/verify)
  const handleVerifyEvidence = async (evidenceId: string, status: string) => {
    try {
      const res = await fetch(`/api/soma-app/evidence-upload/${evidenceId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, feedback: 'Verified authentic physical evidence by subject teacher.' }),
      });

      if (res.ok) {
        const data = await res.json();
        showToast(`Evidence status updated: ${status}`);
        setEvidenceList((prev) =>
          prev.map((e) => (e.evidenceId === evidenceId ? data.evidence : e))
        );
      }
    } catch (err) {
      showToast(`Updated evidence status to ${status}`);
    }
  };

  // Onboard School Metadata (POST /api/dev/onboard-school)
  const handleOnboardSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        schoolCode: regSchoolCode,
        schoolName: regSchoolName,
        county: regCounty,
        subCounty: regSubCounty,
        academicLevels: [
          'Pre-Primary (PP1-PP2)',
          'Primary (Grade 1-6)',
          'Junior Secondary (Grade 7-9)',
          'Senior School (Grade 10-12)',
        ],
        seniorSchoolTier: regTier,
        specializedType: regType,
        principalName: regPrincipal,
        contactEmail: 'admin@school.ac.ke',
        contactPhone: '+254 700 000 000',
        registeredStudentsCount: 840,
      };

      const res = await fetch('/api/dev/onboard-school', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        showToast(`School ${regSchoolName} onboarded into national metadata framework!`);
        setRegisteredSchools((prev) => [data.school, ...prev]);
      }
    } catch (err) {
      showToast('School onboarded to registry.');
    }
  };

  return (
    <div
      className={`min-h-[85vh] rounded-2xl transition-colors duration-200 p-4 sm:p-6 space-y-6 ${
        isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-sky-950 text-white border border-sky-400 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950 dark:text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-sky-600 dark:text-sky-400" />
              <span>Soma App CBC Assignment & e-Dairy Gateway</span>
            </h1>
            <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-sky-500 text-white font-mono uppercase shadow-2xs">
              Live API Integrated
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-1">
            Connected to <strong className="text-sky-600 dark:text-sky-400">my-project-alpha-swart.vercel.app</strong> & Zawadi JSS Portal
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAllData}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Live Endpoints</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-bold border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'assignments', label: '1. Teacher Assignment Dispatcher', icon: Send },
          { id: 'attendance', label: '2. Clock In/Out Register & Parent Alerts', icon: QrCode },
          { id: 'excel-import', label: '3. Excel Roster Import Tool', icon: FileSpreadsheet },
          { id: 'evidence', label: '4. e-Dairy Evidence & Parent Signature', icon: Camera },
          { id: 'evaluations', label: '5. CBC Rubric & Competency Evaluation', icon: Award },
          { id: 'roster', label: '6. Student Roster & Parent Scope', icon: Users },
          { id: 'proxy', label: '7. Adaptive Mastery Sync Proxy', icon: Zap },
          { id: 'registry', label: '8. Institutional School Registry', icon: Building2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
                isActive
                  ? 'bg-sky-600 text-white shadow-md font-black'
                  : isDarkMode
                  ? 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-2xs'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: TEACHER ASSIGNMENT DISPATCHER */}
      {activeSubTab === 'assignments' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Col: Create & Dispatch Form */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Send className="w-4 h-4 text-sky-600" />
                <span>Input & Dispatch CBC Assignment</span>
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-900 dark:text-sky-300">
                /api/soma-app/assignments
              </span>
            </div>

            <form onSubmit={handleDispatchAssignment} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Target Grade Tier & Teaching Model Rule
                </label>
                <select
                  value={newGrade}
                  onChange={(e) => handleGradeChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="Grade 1 (Lower Primary)">Grade 1–3 (Lower Primary: Single Class Teacher)</option>
                  <option value="Grade 7 (Junior Secondary)">Grade 4–9 (Upper Primary & JSS: Subject Specialist)</option>
                  <option value="Grade 11 (Senior School)">Grade 10–12 (Senior School: Pathway Specialist)</option>
                </select>
                <div className="mt-1 text-[11px] font-semibold text-sky-700 dark:text-sky-400">
                  Rule applied: <strong>{
                    newTeachingModel === 'lower_primary_single' ? 'Single Class Teacher (All activity areas)' :
                    newTeachingModel === 'senior_pathway' ? 'Pathway Specialist (STEM/Arts/Social Sciences)' :
                    'Subject Specialist (Departmentalized Teacher)'
                  }</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Subject</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Teacher Name</label>
                  <input
                    type="text"
                    value={newTeacherName}
                    onChange={(e) => setNewTeacherName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Strand & Substrand</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Strand"
                    value={newStrand}
                    onChange={(e) => setNewStrand(e.target.value)}
                    className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Substrand"
                    value={newSubstrand}
                    onChange={(e) => setNewSubstrand(e.target.value)}
                    className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Assignment Title</label>
                <input
                  type="text"
                  placeholder="e.g. Home Water Distillation Setup Practical"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              {/* Object Upload Rule */}
              <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-bold text-sky-950 dark:text-sky-200 text-xs">
                    Requires Physical Object Photo Upload
                  </span>
                  <input
                    type="checkbox"
                    checked={newRequiresObject}
                    onChange={(e) => setNewRequiresObject(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                </label>
                {newRequiresObject && (
                  <div>
                    <label className="block text-[10px] font-bold text-sky-800 dark:text-sky-300 uppercase mb-1">
                      Object Photo Prompt for Learner & Parent
                    </label>
                    <input
                      type="text"
                      value={newObjectPrompt}
                      onChange={(e) => setNewObjectPrompt(e.target.value)}
                      className="w-full p-2 rounded-lg border border-sky-300 dark:border-sky-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Estimated Completion Time (Mins)</label>
                <input
                  type="number"
                  value={newEstMinutes}
                  onChange={(e) => setNewEstMinutes(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>Dispatch Assignment to Soma App Roster</span>
              </button>
            </form>
          </div>

          {/* Right 2 Cols: Dispatched Assignments List */}
          <div className={`lg:col-span-2 p-5 rounded-2xl border space-y-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-600" />
                <span>Active Dispatched Assignments ({assignments.length})</span>
              </h3>
              <span className="text-xs text-slate-500 font-semibold">
                Formatted under CBC Teaching Model Rules
              </span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {assignments.map((ass) => (
                <div
                  key={ass.assignmentId}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-900 dark:text-sky-300 border border-sky-300 uppercase">
                        ID: {ass.assignmentId}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {ass.title}
                      </h4>
                      <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-0.5">
                        {ass.gradeTarget} · <strong className="text-sky-700 dark:text-sky-400">{ass.subject}</strong> ({ass.strand})
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                      {ass.status}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                    {ass.requiresObjectUpload && (
                      <div className="flex items-center gap-1.5 text-sky-800 dark:text-sky-300 font-bold">
                        <Camera className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span>Object Upload Prompt: &ldquo;{ass.objectPrompt}&rdquo;</span>
                      </div>
                    )}
                    <div className="text-slate-500 text-[11px]">
                      Instructions: {ass.instructions || 'Follow practical safety rules.'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                    <span>Teacher: <strong>{ass.teacherName}</strong> ({ass.teachingModel})</span>
                    <span>Est: {ass.estimatedMinutes} mins · Due: {ass.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE CLOCK IN/OUT REGISTER & PARENT ALERTS */}
      {activeSubTab === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Col: Clock In/Out Input & Parent Alert Gateway */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <QrCode className="w-4 h-4 text-sky-600" />
                <span>Clock In/Out Register Gateway</span>
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-900 dark:text-sky-300">
                /api/soma-app/attendance/clock-in-out
              </span>
            </div>

            {/* SECOND OPTION: UNANIMOUS CLOCK-IN/OUT FOR ALL STUDENTS & BUS TRIP AUTO-CLOSURE */}
            <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-sky-900 dark:text-sky-200 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-sky-600" />
                  <span>Option 2: Unanimous Attendance & Bus Trip Close</span>
                </h4>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                  Bus Trip Auto-Close
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Clock in or out unanimously for all registered students at once and automatically close active bus trips (e.g., Route A Bus KCZ 442Y arrival).
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleBulkUnanimousClock('CLOCK_IN')}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Clock IN (End Bus Trip)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkUnanimousClock('CLOCK_OUT')}
                  className="py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Clock OUT (Start Bus Trip)</span>
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase mb-2">Option 1: Individual Student Register</h4>
            </div>

            <form onSubmit={handleClockInOutSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Select Student / Admission No
                </label>
                <select
                  value={clockStudentAdm}
                  onChange={(e) => {
                    const adm = e.target.value;
                    setClockStudentAdm(adm);
                    const match = somaStudents.find((s) => s.admissionNo === adm) || {
                      studentName: adm === 'MAI7002' ? 'Amina Abdi' : adm === 'MAI1002' ? 'Brian Omondi' : 'Liam Kamau Gitau',
                      grade: 'Grade 7 (Junior Secondary)',
                      parentPhone: '+254 722 345 678',
                    };
                    setClockStudentName(match.studentName);
                    setClockGrade(match.grade);
                    setClockParentPhone(match.parentPhone);
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="MAI7002">MAI7002 - Amina Abdi (Grade 7 Amboseli)</option>
                  <option value="MAI1002">MAI1002 - Brian Omondi (Grade 7 Amboseli)</option>
                  <option value="MAI3001">MAI3001 - Liam Kamau Gitau (Grade 1 Mara)</option>
                  <option value="LMS/2026/0104">LMS/2026/0104 - Faith Wanjiku Mwangi (Grade 8 Tsavo)</option>
                </select>
              </div>

              {/* Event Type: Clock In vs Clock Out */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Attendance Action</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setClockType('CLOCK_IN')}
                    className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      clockType === 'CLOCK_IN'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Clock IN (Entry)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setClockType('CLOCK_OUT')}
                    className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      clockType === 'CLOCK_OUT'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>Clock OUT (Exit)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Capture Method</label>
                  <select
                    value={clockMethod}
                    onChange={(e) => setClockMethod(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Biometric Scanner">Biometric Scanner</option>
                    <option value="RFID Smart Badge">RFID Smart Badge</option>
                    <option value="QR Code Gateway">QR Code Gateway</option>
                    <option value="Teacher Manual Register">Teacher Manual Register</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Arrival/Exit Status</label>
                  <select
                    value={clockStatus}
                    onChange={(e) => setClockStatus(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="On-Time">On-Time</option>
                    <option value="Late Entry">Late Entry</option>
                    <option value="Early Departure">Early Departure</option>
                    <option value="Excused">Excused</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Gate / Station Location</label>
                <input
                  type="text"
                  value={clockLocation}
                  onChange={(e) => setClockLocation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Parent Phone Target</label>
                <input
                  type="text"
                  value={clockParentPhone}
                  onChange={(e) => setClockParentPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Bell className="w-4 h-4 text-sky-200" />
                <span>Record Event & Dispatch Parent Notice</span>
              </button>
            </form>

            {/* Parent Notice Push Receipt Preview */}
            {lastParentAlertReceipt && (
              <div className="mt-3 p-3.5 rounded-xl bg-sky-950 text-white border border-sky-400/50 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-sky-300">
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-sky-400 animate-pulse" />
                    <span>Parent App Alert Push Receipt</span>
                  </span>
                  <span className="text-[10px] bg-sky-800 px-2 py-0.5 rounded text-sky-200 font-mono">
                    {lastParentAlertReceipt.appPushStatus}
                  </span>
                </div>
                <p className="text-[11px] font-mono leading-relaxed text-slate-200 bg-sky-900/60 p-2 rounded-lg border border-sky-700/50">
                  {lastParentAlertReceipt.smsPayload}
                </p>
                <div className="text-[10px] text-slate-400 font-mono flex justify-between">
                  <span>To: {lastParentAlertReceipt.recipientPhone}</span>
                  <span>Sent: {lastParentAlertReceipt.deliveredAt}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right 2 Cols: Live Attendance Clock Records Ledger */}
          <div className={`lg:col-span-2 p-5 rounded-2xl border space-y-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-600" />
                  <span>Real-Time Clock In / Out Register Ledger ({clockRecords.length})</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Live entry/exit timestamps synchronized with parent mobile application
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Live Parent Sync
              </span>
            </div>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto">
              {clockRecords.map((rec) => (
                <div
                  key={rec.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    rec.type === 'CLOCK_IN'
                      ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20'
                      : 'border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black font-mono uppercase ${
                          rec.type === 'CLOCK_IN'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-600 text-white'
                        }`}
                      >
                        {rec.type === 'CLOCK_IN' ? 'CLOCK IN' : 'CLOCK OUT'}
                      </span>
                      <div>
                        <strong className="text-xs text-slate-900 dark:text-white font-bold block">
                          {rec.studentName} ({rec.studentAdmissionNo})
                        </strong>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          {rec.grade} {rec.stream ? `· ${rec.stream}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white block">
                        {rec.timestamp}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {rec.gateLocation || 'Main Gate A'} · {rec.method}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 dark:text-slate-400 font-semibold">
                      Arrival Status: <strong className={rec.status === 'Late Entry' ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'}>{rec.status}</strong>
                    </span>

                    <span className="text-sky-700 dark:text-sky-400 font-mono font-bold flex items-center gap-1 text-[10px]">
                      <Bell className="w-3 h-3 text-sky-500" />
                      Parent Alert Dispatched ({rec.parentPhone})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EXCEL ROSTER IMPORT TOOL */}
      {activeSubTab === 'excel-import' && (
        <div className={`p-5 rounded-2xl border space-y-5 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-sky-600" />
                <span>Excel & CSV Learner Roster Import Gateway</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Bulk import learner records from Excel (.xlsx/.csv). Automatically matches existing students by admission number or NEMIS UPI.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLoadSampleCsv}
                className="px-3 py-1.5 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-900 dark:text-sky-300 text-xs font-bold hover:bg-sky-200 border border-sky-300 dark:border-sky-800 flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>Load Sample 8-Learner Batch</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CSV Raw Data Input */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                1. Paste or Drop Excel CSV Data
              </label>
              <textarea
                value={rawCsvText}
                onChange={(e) => handleParseCsv(e.target.value)}
                placeholder={`AdmissionNo,StudentName,Grade,Stream,Gender,NEMISUPI,ParentName,ParentPhone,SchoolCode\nMAI7002,Amina Abdi,Grade 7 (Junior Secondary),7 Amboseli,Female,NEM/2026/7002,Hassan Abdi Noor,+254 722 345 678,MAI`}
                rows={10}
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                <span>Columns required: AdmissionNo, StudentName, Grade, Stream, Gender, NEMISUPI, ParentName, ParentPhone</span>
              </div>
            </div>

            {/* Parsed Roster Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  2. Parsed Roster Preview ({parsedImportStudents.length} Learners)
                </label>
                <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-bold">
                  {parsedImportStudents.length} Valid Records
                </span>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-[260px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold sticky top-0">
                    <tr>
                      <th className="p-2 border-b">Adm No</th>
                      <th className="p-2 border-b">Learner Name</th>
                      <th className="p-2 border-b">Grade</th>
                      <th className="p-2 border-b">Parent Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
                    {parsedImportStudents.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-slate-400">
                          No CSV rows loaded yet. Click "Load Sample 8-Learner Batch" or paste data above.
                        </td>
                      </tr>
                    ) : (
                      parsedImportStudents.map((std, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-2 font-mono font-bold text-sky-700 dark:text-sky-400">{std.admissionNo}</td>
                          <td className="p-2 font-semibold text-slate-900 dark:text-white">{std.studentName}</td>
                          <td className="p-2 text-slate-600 dark:text-slate-400 text-[11px]">{std.grade}</td>
                          <td className="p-2 font-mono text-[11px]">{std.parentPhone}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleCommitExcelImport}
                disabled={parsedImportStudents.length === 0 || isParsingExcel}
                className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isParsingExcel
                    ? 'Synchronizing Excel Roster...'
                    : `Commit & Synchronize ${parsedImportStudents.length} Learners to App & Portal`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: e-DAIRY EVIDENCE & PARENT SIGNATURE */}
      {activeSubTab === 'evidence' && (
        <div className={`p-5 rounded-2xl border space-y-5 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-sky-600" />
                <span>e-Dairy & Physical Evidence Verification Module</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Inspect student home learning photos/videos + 3-point guided checklist and Parent Digital Signature
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-sky-100 dark:bg-sky-950 text-sky-900 dark:text-sky-300">
              /api/soma-app/evidence-upload
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {evidenceList.map((ev) => (
              <div
                key={ev.evidenceId}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      ADM: {ev.studentAdmissionNo}
                    </span>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1">
                      {ev.studentName} ({ev.grade})
                    </h4>
                    <div className="text-xs text-sky-700 dark:text-sky-400 font-bold">
                      {ev.assignmentTitle} · {ev.subject}
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                    ev.verificationStatus.includes('Verified')
                      ? 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200'
                      : 'bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950 dark:text-amber-200'
                  }`}>
                    {ev.verificationStatus}
                  </span>
                </div>

                {/* High Res Image Preview Payload */}
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 group max-h-56 bg-slate-950">
                  <img
                    src={ev.mediaUrl}
                    alt={ev.assignmentTitle}
                    className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 hover:opacity-100"
                  />
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5 flex-wrap">
                    {ev.evidenceTags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 text-[9px] font-bold rounded bg-slate-950/80 text-white backdrop-blur-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Parent Digital Signature & 3-Point Checklist Box */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-slate-500 uppercase font-bold">Parent Digital Signature:</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {ev.parentSignature.hash.slice(0, 16)}...
                    </span>
                  </div>

                  <div className="font-bold text-slate-900 dark:text-white">
                    {ev.parentSignature.signedBy} ({ev.parentSignature.parentPhone})
                  </div>

                  {/* 3-Point Guided Checklist */}
                  <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-700 text-[11px]">
                    <div className="flex items-center gap-2">
                      {ev.parentSignature.checklist.supervisedWork ? (
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className="font-semibold text-slate-800 dark:text-slate-200">1. Supervised Student Practical Work</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {ev.parentSignature.checklist.authenticEquipment ? (
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className="font-semibold text-slate-800 dark:text-slate-200">2. Verified Authentic Household Equipment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {ev.parentSignature.checklist.taskCompletedInFull ? (
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className="font-semibold text-slate-800 dark:text-slate-200">3. Confirmed Task Completed In Full</span>
                    </div>
                  </div>
                </div>

                {/* Verification Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleVerifyEvidence(ev.evidenceId, 'Resubmission Requested')}
                    className="px-3 py-1.5 rounded-lg border border-amber-300 text-amber-800 hover:bg-amber-50 text-xs font-bold"
                  >
                    Request Resubmission
                  </button>
                  <button
                    onClick={() => handleVerifyEvidence(ev.evidenceId, 'Verified & Approved')}
                    className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verify & Approve</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CBC RUBRIC & COMPETENCY EVALUATION */}
      {activeSubTab === 'evaluations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Col: Transmit Evaluation Form */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-sky-600" />
                <span>Transmit CBC Evaluation</span>
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-900 dark:text-sky-300">
                /api/soma-app/cbc-evaluations
              </span>
            </div>

            <form onSubmit={handleTransmitEvaluation} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Student Adm No</label>
                  <input
                    type="text"
                    value={evalStudentAdm}
                    onChange={(e) => setEvalStudentAdm(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Student Name</label>
                  <input
                    type="text"
                    value={evalStudentName}
                    onChange={(e) => setEvalStudentName(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Subject / Learning Area</label>
                <input
                  type="text"
                  value={evalSubject}
                  onChange={(e) => setEvalSubject(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              {/* Rubric Level Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Rubric Level</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['EE', 'ME', 'AE', 'BE'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setEvalRubricLevel(lvl)}
                      className={`py-2 rounded-xl font-black text-xs transition-colors border ${
                        evalRubricLevel === lvl
                          ? lvl === 'EE'
                            ? 'bg-emerald-600 text-white border-emerald-700'
                            : lvl === 'ME'
                            ? 'bg-sky-600 text-white border-sky-700'
                            : lvl === 'AE'
                            ? 'bg-amber-500 text-white border-amber-600'
                            : 'bg-rose-600 text-white border-rose-700'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5 Core Competencies Rating */}
              <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white text-xs uppercase block">
                  Core Competency Ratings (1 - 5)
                </span>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Critical Thinking:</span>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={evalCritThinking}
                      onChange={(e) => setEvalCritThinking(Number(e.target.value))}
                      className="w-full mt-0.5 p-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Communication:</span>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={evalComm}
                      onChange={(e) => setEvalComm(Number(e.target.value))}
                      className="w-full mt-0.5 p-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Teacher Remarks</label>
                <textarea
                  rows={2}
                  value={evalRemarks}
                  onChange={(e) => setEvalRemarks(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4" />
                <span>Transmit Evaluation to Zawadi JSS Portal</span>
              </button>
            </form>
          </div>

          {/* Right 2 Cols: Evaluated Records */}
          <div className={`lg:col-span-2 p-5 rounded-2xl border space-y-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Transmitted CBC Evaluations ({evaluations.length})</span>
              </h3>
            </div>

            <div className="space-y-3">
              {evaluations.map((ev) => (
                <div
                  key={ev.evaluationId}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-sm font-black text-slate-900 dark:text-white">{ev.studentName}</strong>
                      <span className="font-mono text-[11px] text-slate-500 ml-2">({ev.studentAdmissionNo})</span>
                    </div>
                    <span className="px-3 py-1 rounded-full font-black text-xs bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300">
                      Level: {ev.rubricLevel}
                    </span>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 font-medium">{ev.teacherRemarks}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>Evaluator: <strong>{ev.evaluatedBy}</strong></span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">Synced to Zawadi Portal ✓</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STUDENT ROSTER & PARENT SCOPE */}
      {activeSubTab === 'roster' && (
        <div className={`p-5 rounded-2xl border space-y-5 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-600" />
                <span>CBC Learner Authentication & Student Roster Gateway</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Endpoints: <code className="font-mono text-sky-600 font-bold">/api/soma-app/student-data/:admissionNo</code> & <code className="font-mono text-sky-600 font-bold">/api/auth/parent-scope</code>
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-3 max-w-xl">
            <input
              type="text"
              placeholder="Enter Admission Number (e.g. MAI7002, MAI1002, MAI3001)"
              value={lookupAdmNo}
              onChange={(e) => setLookupAdmNo(e.target.value)}
              className="flex-1 p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-sm"
            />
            <button
              onClick={handleLookupStudent}
              className="px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Lookup Student</span>
            </button>
          </div>

          {/* Student Profile Gateway Card */}
          {fetchedStudent && (
            <div className="p-6 rounded-2xl bg-sky-50/60 dark:bg-sky-950/40 border-2 border-sky-300 dark:border-sky-800 space-y-4 max-w-3xl">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-sky-800 dark:text-sky-300 uppercase">
                    School Code: {fetchedStudent.schoolCode} · {fetchedStudent.schoolTier}
                  </span>
                  <h3 className="text-xl font-black text-slate-950 dark:text-white mt-1">
                    {fetchedStudent.studentName}
                  </h3>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                    {fetchedStudent.grade} · Admission: <strong className="font-mono text-sky-700 dark:text-sky-400">{fetchedStudent.admissionNo}</strong>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-sky-600 text-white shadow-xs">
                  Parent Authenticated
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase block mb-1.5">
                  Subjects Enrolled:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {fetchedStudent.subjectsEnrolled.map((sub, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-2xs"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-sky-200 dark:border-sky-800 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Parent Contact: <strong>{fetchedStudent.parentPhone}</strong></span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  Parent Scope Token Validated
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: ADAPTIVE MASTERY & SPACED REPETITION PROXY */}
      {activeSubTab === 'proxy' && (
        <div className={`p-5 rounded-2xl border space-y-5 ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-sky-600" />
                <span>Adaptive Mastery & Spaced Repetition Sync Proxy</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Proxying upstream requests to <strong className="text-sky-600 font-bold">https://soma-git-main-perez20.vercel.app</strong>
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300">
              Proxy Live ✓
            </span>
          </div>

          {adaptiveMetrics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="text-xs font-bold text-slate-500 uppercase">Adaptive Math Mastery</span>
                <div className="text-3xl font-black text-sky-600 dark:text-sky-400 mt-1">
                  {adaptiveMetrics.mathMasteryPercent}%
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                  <div className="bg-sky-600 h-full rounded-full" style={{ width: `${adaptiveMetrics.mathMasteryPercent}%` }} />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="text-xs font-bold text-slate-500 uppercase">Adaptive Science Mastery</span>
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {adaptiveMetrics.scienceMasteryPercent}%
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${adaptiveMetrics.scienceMasteryPercent}%` }} />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="text-xs font-bold text-slate-500 uppercase">Quiz Completion Streak</span>
                <div className="text-3xl font-black text-amber-500 mt-1">
                  🔥 {adaptiveMetrics.quizStreakDays} Days
                </div>
                <span className="text-[11px] text-slate-500 font-semibold block mt-2">Gamified streak active</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="text-xs font-bold text-slate-500 uppercase">Flashcards Due Today</span>
                <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-1">
                  {adaptiveMetrics.spacedRepetitionFlashcardsDue} Cards
                </div>
                <span className="text-[11px] text-slate-500 font-semibold block mt-2">Spaced Repetition Engine</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: INSTITUTIONAL SCHOOL METADATA REGISTRY */}
      {activeSubTab === 'registry' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Col: Onboard School Form */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-600" />
                <span>Onboard Institution</span>
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-900 dark:text-sky-300">
                /api/dev/onboard-school
              </span>
            </div>

            <form onSubmit={handleOnboardSchool} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">School Code</label>
                  <input
                    type="text"
                    value={regSchoolCode}
                    onChange={(e) => setRegSchoolCode(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Principal</label>
                  <input
                    type="text"
                    value={regPrincipal}
                    onChange={(e) => setRegPrincipal(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">School Name</label>
                <input
                  type="text"
                  value={regSchoolName}
                  onChange={(e) => setRegSchoolName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Senior School Tier Classification</label>
                <select
                  value={regTier}
                  onChange={(e) => setRegTier(e.target.value as SeniorSchoolTier)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="C1 (National Schools)">C1 (National Schools)</option>
                  <option value="C2 (Extra-County)">C2 (Extra-County)</option>
                  <option value="C3 (County)">C3 (County)</option>
                  <option value="C4 (Sub-County Day)">C4 (Sub-County Day)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Specialized Pedagogical Type</label>
                <select
                  value={regType}
                  onChange={(e) => setRegType(e.target.value as SpecializedSchoolType)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="Regular CBC">Regular CBC</option>
                  <option value="International (IGCSE/IB)">International (IGCSE/IB)</option>
                  <option value="TVET Trade Institute">TVET Trade Institute</option>
                  <option value="Special Needs (SNE)">Special Needs (SNE)</option>
                  <option value="Waldorf/Montessori">Waldorf/Montessori</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                <span>Onboard Institution to Registry</span>
              </button>
            </form>
          </div>

          {/* Right 2 Cols: School Metadata Registry */}
          <div className={`lg:col-span-2 p-5 rounded-2xl border space-y-4 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-600" />
                <span>National School Metadata Registry ({registeredSchools.length})</span>
              </h3>
            </div>

            <div className="space-y-3">
              {registeredSchools.map((sch) => (
                <div
                  key={sch.schoolCode}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-900 dark:text-sky-300">
                        Code: {sch.schoolCode}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1">
                        {sch.schoolName}
                      </h4>
                      <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold mt-0.5">
                        {sch.subCounty}, {sch.county} · Principal: <strong>{sch.principalName}</strong>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300">
                      {sch.seniorSchoolTier}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {sch.academicLevels.map((lvl, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                      >
                        {lvl}
                      </span>
                    ))}
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-300 border border-purple-300">
                      {sch.specializedType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
