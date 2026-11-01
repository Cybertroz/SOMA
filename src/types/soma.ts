/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TeachingModel = 'lower_primary_single' | 'jss_specialist' | 'senior_pathway';

export type SeniorSchoolTier =
  | 'C1 (National Schools)'
  | 'C2 (Extra-County)'
  | 'C3 (County)'
  | 'C4 (Sub-County Day)';

export type SpecializedSchoolType =
  | 'Regular CBC'
  | 'International (IGCSE/IB)'
  | 'TVET Trade Institute'
  | 'Special Needs (SNE)'
  | 'Waldorf/Montessori';

export type AcademicLevel =
  | 'Pre-Primary (PP1-PP2)'
  | 'Primary (Grade 1-6)'
  | 'Junior Secondary (Grade 7-9)'
  | 'Senior School (Grade 10-12)'
  | 'Tertiary/TVET';

export interface SomaStudentData {
  admissionNo: string;
  studentName: string;
  grade: string;
  schoolCode: string;
  schoolTier: SeniorSchoolTier;
  subjectsEnrolled: string[];
  parentPhone: string;
  parentName?: string;
  photoUrl?: string;
  attendanceRate?: number;
}

export interface SomaAssignment {
  assignmentId: string;
  title: string;
  gradeTarget: string;
  subject: string;
  strand: string;
  substrand?: string;
  teacherName: string;
  teachingModel: TeachingModel;
  estimatedMinutes: number;
  dueDate: string;
  requiresObjectUpload: boolean;
  objectPrompt?: string;
  instructions?: string;
  maxScore?: number;
  status: 'Active / Dispatched' | 'Draft' | 'Archived';
  createdAt: string;
}

export interface SomaCbcEvaluation {
  evaluationId: string;
  assignmentId: string;
  assignmentTitle: string;
  studentAdmissionNo: string;
  studentName: string;
  grade: string;
  subject: string;
  strand: string;
  rubricLevel: 'EE' | 'ME' | 'AE' | 'BE';
  coreCompetencies: {
    criticalThinking: number; // 1-5
    communication: number; // 1-5
    digitalLiteracy: number; // 1-5
    selfEfficacy: number; // 1-5
    creativity: number; // 1-5
  };
  values: {
    responsibility: 'Exemplary' | 'Satisfactory' | 'Needs Growth';
    integrity: 'Exemplary' | 'Satisfactory' | 'Needs Growth';
    respect: 'Exemplary' | 'Satisfactory' | 'Needs Growth';
  };
  teacherRemarks: string;
  evaluatedBy: string;
  evaluatedAt: string;
  syncedToZawadiPortal: boolean;
}

export interface SomaEvidenceUpload {
  evidenceId: string;
  assignmentId: string;
  assignmentTitle: string;
  studentAdmissionNo: string;
  studentName: string;
  grade: string;
  subject: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  timestamp: string;
  evidenceTags: string[];
  studentNotes?: string;
  parentSignature: {
    signedBy: string;
    parentPhone: string;
    timestamp: string;
    hash: string; // e.g. "sig_sha256_88e09f..."
    checklist: {
      supervisedWork: boolean;
      authenticEquipment: boolean;
      taskCompletedInFull: boolean;
    };
  };
  verificationStatus: 'Pending Teacher Review' | 'Verified & Approved' | 'Resubmission Requested';
  teacherFeedback?: string;
}

export interface SomaAdaptiveSyncMetrics {
  studentAdmissionNo: string;
  studentName: string;
  mathMasteryPercent: number; // e.g. 92
  scienceMasteryPercent: number; // e.g. 88
  quizStreakDays: number; // e.g. 14
  badgesEarned: string[];
  spacedRepetitionFlashcardsDue: number;
  lastSyncedAt: string;
  upstreamProxyUrl: string;
  connectionStatus: 'Connected (Proxy Live)' | 'Sync Delayed' | 'Offline Cache';
}

export interface SchoolOnboardingMetadata {
  schoolCode: string;
  schoolName: string;
  county: string;
  subCounty: string;
  academicLevels: AcademicLevel[];
  seniorSchoolTier: SeniorSchoolTier;
  specializedType: SpecializedSchoolType;
  principalName: string;
  contactEmail: string;
  contactPhone: string;
  registeredStudentsCount: number;
  onboardedAt: string;
  status: 'Active Registry' | 'Pending Verification';
}

export interface SomaClockRecord {
  id: string;
  studentAdmissionNo: string;
  studentName: string;
  grade: string;
  stream?: string;
  parentPhone: string;
  type: 'CLOCK_IN' | 'CLOCK_OUT';
  timestamp: string;
  isoTimestamp: string;
  method: 'Biometric Scanner' | 'RFID Smart Badge' | 'QR Code Gateway' | 'Teacher Manual Register';
  status: 'On-Time' | 'Late Entry' | 'Early Departure' | 'Excused';
  parentNotified: boolean;
  notificationId?: string;
  gateLocation?: string;
}

export interface SomaImportStudent {
  admissionNo: string;
  studentName: string;
  grade: string;
  stream: string;
  gender: 'Male' | 'Female';
  nemisUpi: string;
  parentName: string;
  parentPhone: string;
  schoolCode: string;
  schoolTier?: SeniorSchoolTier;
}

