/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  INITIAL_SOMA_STUDENTS,
  INITIAL_SOMA_ASSIGNMENTS,
  INITIAL_SOMA_EVALUATIONS,
  INITIAL_SOMA_EVIDENCE,
  INITIAL_SOMA_ADAPTIVE_METRICS,
  INITIAL_SCHOOL_REGISTRY,
  INITIAL_SOMA_CLOCK_RECORDS,
} from './src/data/mockSomaData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory Stores for Live Reading/Writing across endpoints
let somaStudents = [...INITIAL_SOMA_STUDENTS];
let somaAssignments = [...INITIAL_SOMA_ASSIGNMENTS];
let somaEvaluations = [...INITIAL_SOMA_EVALUATIONS];
let somaEvidence = [...INITIAL_SOMA_EVIDENCE];
let somaAdaptiveMetrics = { ...INITIAL_SOMA_ADAPTIVE_METRICS };
let schoolRegistry = [...INITIAL_SCHOOL_REGISTRY];
let somaClockRecords = [...INITIAL_SOMA_CLOCK_RECORDS];

// ============================================================================
// 1. CBC Learner Authentication & Student Roster Gateway Module
// Endpoint: /api/soma-app/student-data/:admissionNo & /api/auth/parent-scope
// ============================================================================
app.get('/api/soma-app/student-data/:admissionNo', (req: Request, res: Response) => {
  const { admissionNo } = req.params;
  const student = somaStudents.find(
    (s) => s.admissionNo.toLowerCase() === admissionNo.toLowerCase()
  );

  if (!student) {
    // Fallback response for new or dynamic lookup
    return res.json({
      admissionNo,
      studentName: 'Learner ' + admissionNo,
      grade: 'Grade 7 (Junior Secondary)',
      schoolCode: admissionNo.slice(0, 3).toUpperCase() || 'LMS',
      schoolTier: 'C1 (National Schools)',
      subjectsEnrolled: [
        'Integrated Science',
        'Mathematics',
        'Pre-Technical Studies',
        'Computer Science',
      ],
      parentPhone: '+254 722 000 000',
    });
  }

  res.json({
    admissionNo: student.admissionNo,
    studentName: student.studentName,
    grade: student.grade,
    schoolCode: student.schoolCode,
    schoolTier: student.schoolTier,
    subjectsEnrolled: student.subjectsEnrolled,
    parentPhone: student.parentPhone,
  });
});

app.post('/api/auth/parent-scope', (req: Request, res: Response) => {
  const { admissionNo, parentPhone } = req.body;
  const student = somaStudents.find(
    (s) => s.admissionNo.toLowerCase() === (admissionNo || '').toLowerCase()
  );

  res.json({
    authenticated: true,
    admissionNo: student?.admissionNo || admissionNo || 'MAI7002',
    studentName: student?.studentName || 'Amina Abdi',
    grade: student?.grade || 'Grade 7 (Junior Secondary)',
    schoolCode: student?.schoolCode || 'MAI',
    schoolTier: student?.schoolTier || 'C1 (National Schools)',
    subjectsEnrolled: student?.subjectsEnrolled || [
      'Integrated Science',
      'Mathematics',
      'Pre-Technical Studies',
      'Computer Science',
    ],
    parentPhone: parentPhone || student?.parentPhone || '+254 722 345 678',
    scopeToken: `parent_token_${Date.now()}_sha256`,
  });
});

app.get('/api/soma-app/students', (_req: Request, res: Response) => {
  res.json({
    count: somaStudents.length,
    students: somaStudents,
  });
});

app.post('/api/soma-app/students/import-excel', (req: Request, res: Response) => {
  const { students } = req.body;
  if (!Array.isArray(students)) {
    return res.status(400).json({ error: 'Payload must contain a students array.' });
  }

  let updatedCount = 0;
  let insertedCount = 0;

  students.forEach((imp: any) => {
    const existingIndex = somaStudents.findIndex(
      (s) => s.admissionNo.toLowerCase() === (imp.admissionNo || '').toLowerCase()
    );
    if (existingIndex >= 0) {
      somaStudents[existingIndex] = {
        ...somaStudents[existingIndex],
        ...imp,
        subjectsEnrolled: imp.subjectsEnrolled || somaStudents[existingIndex].subjectsEnrolled,
      };
      updatedCount++;
    } else {
      somaStudents.push({
        admissionNo: imp.admissionNo || `MAI${Math.floor(1000 + Math.random() * 9000)}`,
        studentName: imp.studentName || 'New Imported Learner',
        grade: imp.grade || 'Grade 7 (Junior Secondary)',
        schoolCode: imp.schoolCode || 'MAI',
        schoolTier: imp.schoolTier || 'C1 (National Schools)',
        subjectsEnrolled: imp.subjectsEnrolled || ['Integrated Science', 'Mathematics', 'Kiswahili', 'English'],
        parentPhone: imp.parentPhone || '+254 700 000 000',
        parentName: imp.parentName || 'Parent / Guardian',
        attendanceRate: 100,
      });
      insertedCount++;
    }
  });

  res.status(200).json({
    success: true,
    message: `Excel Roster Import complete: ${insertedCount} new learners inserted, ${updatedCount} existing records updated.`,
    count: somaStudents.length,
    students: somaStudents,
  });
});

// Clock In/Out Attendance & Parent Notification Endpoint
app.get('/api/soma-app/attendance/clock-in-out', (_req: Request, res: Response) => {
  res.json({
    count: somaClockRecords.length,
    records: somaClockRecords,
  });
});

app.post('/api/soma-app/attendance/clock-in-out', (req: Request, res: Response) => {
  const {
    studentAdmissionNo,
    studentName,
    grade,
    stream,
    parentPhone,
    type,
    method,
    status,
    gateLocation,
  } = req.body;

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = now.toISOString().slice(0, 10);
  const formattedTimestamp = `${dateStr} ${timeStr}`;

  const notificationId = `notif_app_${Date.now()}`;

  const record = {
    id: `clk_${Date.now()}`,
    studentAdmissionNo: studentAdmissionNo || 'MAI7002',
    studentName: studentName || 'Amina Abdi',
    grade: grade || 'Grade 7 (Junior Secondary)',
    stream: stream || '7 Amboseli',
    parentPhone: parentPhone || '+254 722 345 678',
    type: (type || 'CLOCK_IN') as 'CLOCK_IN' | 'CLOCK_OUT',
    timestamp: formattedTimestamp,
    isoTimestamp: now.toISOString(),
    method: method || 'Biometric Scanner',
    status: status || 'On-Time',
    parentNotified: true,
    notificationId,
    gateLocation: gateLocation || 'Main Gate A',
  };

  somaClockRecords.unshift(record);

  res.status(201).json({
    success: true,
    message: `Student ${record.studentName} (${record.type}) recorded. Parent alert dispatched to ${record.parentPhone}.`,
    record,
    parentNotificationReceipt: {
      notificationId,
      recipientPhone: record.parentPhone,
      smsPayload: `[SOMA APP NOTICE] ${record.studentName} has clocked ${record.type === 'CLOCK_IN' ? 'IN' : 'OUT'} at ${record.gateLocation} at ${timeStr} (${record.status}).`,
      deliveredAt: formattedTimestamp,
      appPushStatus: 'Pushed to Parent Mobile App',
    },
  });
});

// Unanimous Bulk Clock-In/Out for All Students & Bus Trip Tracking Endpoint
app.post('/api/soma-app/attendance/bulk-clock', (req: Request, res: Response) => {
  const { type, routeName, busNumber, gateLocation } = req.body;
  const actionType = (type || 'CLOCK_IN') as 'CLOCK_IN' | 'CLOCK_OUT';
  const busRoute = routeName || 'Route A: Westlands - Limuru Express (Bus KCZ 442Y)';

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = now.toISOString().slice(0, 10);
  const formattedTimestamp = `${dateStr} ${timeStr}`;

  const newRecords: any[] = [];

  somaStudents.forEach((student, idx) => {
    const notificationId = `notif_bulk_${Date.now()}_${idx}`;
    const record = {
      id: `clk_bulk_${Date.now()}_${idx}`,
      studentAdmissionNo: student.admissionNo,
      studentName: student.studentName,
      grade: student.grade,
      stream: '7 Amboseli',
      parentPhone: student.parentPhone || '+254 722 000 000',
      type: actionType,
      timestamp: formattedTimestamp,
      isoTimestamp: now.toISOString(),
      method: 'RFID Smart Badge' as const,
      status: 'On-Time' as const,
      parentNotified: true,
      notificationId,
      gateLocation: gateLocation || (actionType === 'CLOCK_IN' ? 'School Arrival (Bus Trip Ended)' : 'Bus Departure (Bus Trip Started)'),
    };
    somaClockRecords.unshift(record);
    newRecords.push(record);
  });

  const tripStatusMsg =
    actionType === 'CLOCK_IN'
      ? `Bus trip for "${busRoute}" successfully ENDED & students arrived safely.`
      : `Bus trip for "${busRoute}" successfully STARTED & transit tracking activated.`;

  res.status(201).json({
    success: true,
    message: `Successfully recorded ${actionType} for all ${somaStudents.length} students. ${tripStatusMsg}`,
    totalProcessed: somaStudents.length,
    actionType,
    busTripStatus: actionType === 'CLOCK_IN' ? 'Trip Ended & Students Arrived' : 'Trip Started & Tracking Active',
    busRoute,
    timestamp: formattedTimestamp,
    recordsSample: newRecords.slice(0, 5),
  });
});




// ============================================================================
// 2. Teacher Assignment Input & Dispatch Module
// Endpoint: /api/soma-app/assignments
// ============================================================================
app.get('/api/soma-app/assignments', (_req: Request, res: Response) => {
  res.json({
    count: somaAssignments.length,
    assignments: somaAssignments,
  });
});

app.post('/api/soma-app/assignments', (req: Request, res: Response) => {
  const payload = req.body;

  const newAssignment = {
    assignmentId: payload.assignmentId || `cbc_${Math.floor(10000 + Math.random() * 90000)}`,
    title: payload.title || payload.objectPrompt || 'CBC Homework Task',
    gradeTarget: payload.gradeTarget || 'Grade 7 (Junior Secondary)',
    subject: payload.subject || 'Integrated Science',
    strand: payload.strand || 'General Strand',
    substrand: payload.substrand || 'General Substrand',
    teacherName: payload.teacherName || 'Mr. Joseph Kamau',
    teachingModel: payload.teachingModel || 'jss_specialist',
    estimatedMinutes: payload.estimatedMinutes || 30,
    dueDate: payload.dueDate || '2026-11-05',
    requiresObjectUpload: Boolean(payload.requiresObjectUpload),
    objectPrompt: payload.objectPrompt || 'Photograph your practical work',
    instructions: payload.instructions || 'Follow CBC guidelines for home practicals.',
    maxScore: payload.maxScore || 100,
    status: 'Active / Dispatched' as const,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  };

  somaAssignments.unshift(newAssignment);

  res.status(201).json({
    success: true,
    message: 'Assignment dispatched to student roster & e-Dairy portal.',
    assignment: newAssignment,
  });
});

// ============================================================================
// 3. Rubric Assessment & Competency Evaluation Module
// Endpoint: /api/soma-app/cbc-evaluations
// ============================================================================
app.get('/api/soma-app/cbc-evaluations', (_req: Request, res: Response) => {
  res.json({
    count: somaEvaluations.length,
    evaluations: somaEvaluations,
  });
});

app.post('/api/soma-app/cbc-evaluations', (req: Request, res: Response) => {
  const payload = req.body;

  const evaluation = {
    evaluationId: `eval_${Date.now()}`,
    assignmentId: payload.assignmentId || 'cbc_17934',
    assignmentTitle: payload.assignmentTitle || 'Home Water Distillation Setup Practical',
    studentAdmissionNo: payload.studentAdmissionNo || 'MAI7002',
    studentName: payload.studentName || 'Amina Abdi',
    grade: payload.grade || 'Grade 7 (Junior Secondary)',
    subject: payload.subject || 'Integrated Science',
    strand: payload.strand || 'Mixtures, Elements and Compounds',
    rubricLevel: payload.rubricLevel || 'EE',
    coreCompetencies: payload.coreCompetencies || {
      criticalThinking: 5,
      communication: 5,
      digitalLiteracy: 4,
      selfEfficacy: 5,
      creativity: 5,
    },
    values: payload.values || {
      responsibility: 'Exemplary',
      integrity: 'Exemplary',
      respect: 'Exemplary',
    },
    teacherRemarks: payload.teacherRemarks || 'Excellent work verified against CBC rubrics.',
    evaluatedBy: payload.evaluatedBy || 'Mr. Joseph Kamau',
    evaluatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    syncedToZawadiPortal: true,
  };

  somaEvaluations.unshift(evaluation);

  res.status(201).json({
    success: true,
    message: 'CBC Rubric Evaluation transmitted to Zawadi JSS Portal & Soma App.',
    evaluation,
  });
});

// ============================================================================
// 4. e-Dairy & Physical Evidence Verification Module
// Endpoint: /api/soma-app/evidence-upload
// ============================================================================
app.get('/api/soma-app/evidence-upload', (_req: Request, res: Response) => {
  res.json({
    count: somaEvidence.length,
    evidence: somaEvidence,
  });
});

app.post('/api/soma-app/evidence-upload', (req: Request, res: Response) => {
  const payload = req.body;

  const newEvidence = {
    evidenceId: `ev_${Date.now()}`,
    assignmentId: payload.assignmentId || 'cbc_17934',
    assignmentTitle: payload.assignmentTitle || 'Home Practical Task',
    studentAdmissionNo: payload.studentAdmissionNo || 'MAI7002',
    studentName: payload.studentName || 'Amina Abdi',
    grade: payload.grade || 'Grade 7 (Junior Secondary)',
    subject: payload.subject || 'Integrated Science',
    mediaType: (payload.mediaType || 'image') as 'image' | 'video',
    mediaUrl: payload.mediaUrl || 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    evidenceTags: payload.evidenceTags || ['Home Practical', 'Physical Evidence'],
    studentNotes: payload.studentNotes || 'Task completed with parent guidance.',
    parentSignature: payload.parentSignature || {
      signedBy: 'Parent / Guardian',
      parentPhone: '+254 722 345 678',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      hash: `sig_sha256_${Date.now().toString(16)}`,
      checklist: {
        supervisedWork: true,
        authenticEquipment: true,
        taskCompletedInFull: true,
      },
    },
    verificationStatus: 'Pending Teacher Review' as const,
  };

  somaEvidence.unshift(newEvidence);

  res.status(201).json({
    success: true,
    message: 'e-Dairy Physical Evidence uploaded and linked with Parent Digital Signature.',
    evidence: newEvidence,
  });
});

app.patch('/api/soma-app/evidence-upload/:id/verify', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, feedback } = req.body;

  const target = somaEvidence.find((e) => e.evidenceId === id);
  if (!target) {
    return res.status(404).json({ error: 'Evidence record not found' });
  }

  target.verificationStatus = status || 'Verified & Approved';
  target.teacherFeedback = feedback || 'Verified by Teacher.';

  res.json({
    success: true,
    message: `Evidence status updated to ${target.verificationStatus}`,
    evidence: target,
  });
});

// ============================================================================
// 5. Adaptive Mastery & Spaced Repetition Sync Proxy
// Endpoint: /api/soma-proxy/* & /api/soma-sync
// ============================================================================
app.get('/api/soma-sync', (_req: Request, res: Response) => {
  res.json(somaAdaptiveMetrics);
});

app.post('/api/soma-sync', (req: Request, res: Response) => {
  const payload = req.body;
  somaAdaptiveMetrics = {
    ...somaAdaptiveMetrics,
    ...payload,
    lastSyncedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  };
  res.json({
    success: true,
    message: 'Adaptive mastery & spaced repetition flashcard schedule synced.',
    metrics: somaAdaptiveMetrics,
  });
});

app.all('/api/soma-proxy/*', (req: Request, res: Response) => {
  const proxyPath = req.params[0] || '';
  res.json({
    proxyTarget: 'https://soma-git-main-perez20.vercel.app',
    proxiedPath: `/${proxyPath}`,
    method: req.method,
    status: '200 OK (Proxied via AI Studio Backend)',
    syncedMetrics: somaAdaptiveMetrics,
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// 6. Institutional Classification & School Metadata Registry
// Endpoint: /api/dev/onboard-school
// ============================================================================
app.get('/api/dev/onboard-school', (_req: Request, res: Response) => {
  res.json({
    count: schoolRegistry.length,
    schools: schoolRegistry,
  });
});

app.post('/api/dev/onboard-school', (req: Request, res: Response) => {
  const payload = req.body;

  const newSchool = {
    schoolCode: payload.schoolCode || `SCH_${Math.floor(100 + Math.random() * 900)}`,
    schoolName: payload.schoolName || 'New Onboarded Institution',
    county: payload.county || 'Nairobi County',
    subCounty: payload.subCounty || 'Central Sub-County',
    academicLevels: payload.academicLevels || [
      'Primary (Grade 1-6)',
      'Junior Secondary (Grade 7-9)',
      'Senior School (Grade 10-12)',
    ],
    seniorSchoolTier: payload.seniorSchoolTier || 'C2 (Extra-County)',
    specializedType: payload.specializedType || 'Regular CBC',
    principalName: payload.principalName || 'Head Principal',
    contactEmail: payload.contactEmail || 'admin@school.ac.ke',
    contactPhone: payload.contactPhone || '+254 700 000 000',
    registeredStudentsCount: payload.registeredStudentsCount || 500,
    onboardedAt: new Date().toISOString().slice(0, 10),
    status: 'Active Registry' as const,
  };

  schoolRegistry.unshift(newSchool);

  res.status(201).json({
    success: true,
    message: 'School categorized and onboarded into national metadata framework.',
    school: newSchool,
  });
});

// Vite Middleware for Dev Mode
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });

  app.use(vite.middlewares);

  app.use('*', async (req: Request, res: Response, next) => {
    const url = req.originalUrl;
    try {
      let template = await vite.transformIndexHtml(
        url,
        `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Limuru Model Comprehensive School | Soma App & MoE CBC Portal</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
      );
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e: any) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
} else {
  // Production static serving
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[Soma API Server] Running on http://localhost:${PORT}`);
});
