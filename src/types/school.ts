/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GradeLevel =
  | 'Grade 1'
  | 'Grade 2'
  | 'Grade 3'
  | 'Grade 4'
  | 'Grade 5'
  | 'Grade 6'
  | 'Grade 7'
  | 'Grade 8'
  | 'Grade 9';

export type UserRole = 'principal' | 'bursar' | 'class_master' | 'teacher' | 'parent' | 'moe_director';

export type PermissionKey =
  | 'view_dashboard'
  | 'manage_admissions'
  | 'view_admissions'
  | 'manage_cbc_marks'
  | 'view_cbc_marks'
  | 'manage_fees'
  | 'view_fees'
  | 'manage_daraja_mpesa'
  | 'manage_voteheads_bursaries'
  | 'view_voteheads_bursaries'
  | 'send_bulk_sms'
  | 'manage_payroll'
  | 'view_payroll'
  | 'manage_timetables'
  | 'view_timetables'
  | 'view_knec_analytics'
  | 'manage_portfolios_health'
  | 'view_portfolios_health'
  | 'manage_assets'
  | 'manage_kitchen_inventory'
  | 'manage_textbooks'
  | 'generate_report_cards'
  | 'manage_tpad'
  | 'access_parent_portal'
  | 'manage_teachers'
  | 'view_teachers'
  | 'manage_fleet'
  | 'view_fleet'
  | 'manage_kemis_sync'
  | 'view_kemis_sync'
  | 'view_audit_logs'
  | 'moe_county_oversight'
  | 'moe_fund_disbursement'
  | 'moe_transfer_approval';

export interface AuthUser {
  id: string;
  uuid: string; // Immutable RFC-4122 UUID locking user to active session
  name: string;
  role: UserRole;
  title: string;
  department: string;
  email: string;
  phone: string;
  avatarInitials: string;
  assignedGrade?: GradeLevel;
  assignedStream?: string;
  assignedSubjects?: string[];
  linkedLearnerId?: string; // For parent persona
}

export interface RolePermissionConfig {
  role: UserRole;
  title: string;
  shortDescription: string;
  dataSafeguardNotice: string;
  accessibleTabs: string[];
  permissions: Record<PermissionKey, boolean>;
}

export type SchoolSection = 'Lower Primary' | 'Upper Primary' | 'Junior Secondary';

export type CBCLevel = 'EE' | 'ME' | 'AE' | 'BE';

export type VoteHead =
  | 'Tuition & Learning Materials'
  | 'Operations & Maintenance'
  | 'Boarding & Meals'
  | 'Activity & Co-Curricular'
  | 'PTA Development'
  | 'Exam & Assessment';

export interface SubjectAssessment {
  formative: CBCLevel;
  summativeScore: number; // 0 - 100
  level: CBCLevel;
  remarks: string;
}

export interface DisciplineIncident {
  id: string;
  date: string;
  nature: string;
  actionTaken: string;
  reportedBy: string;
  status: 'Resolved' | 'Under Guidance & Counseling' | 'Pending Parent Meeting';
}

export interface Learner {
  id: string;
  admissionNo: string; // e.g. LMS/2026/0104
  nemisUpi: string; // e.g. UPI-7849201-K
  kemisStatus: 'Verified' | 'Pending Sync' | 'Flagged';
  assessmentNo: string; // KNEC Assessment No
  birthCertNo: string;
  name: string;
  gender: 'Male' | 'Female';
  grade: GradeLevel;
  stream: string;
  dob: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string;
  parentNationalId?: string; // Kenya National ID for KEMIS verification & capitation
  isPhoneEncrypted?: boolean;
  isNationalIdEncrypted?: boolean;
  bloodGroup?: string;
  medicalAllergies?: string;
  coCurricular: string;
  disciplineIncidents: DisciplineIncident[];
  fees: {
    totalTermFee: number;
    paidAmount: number;
    balance: number;
    status: 'Cleared' | 'Partial' | 'Defaulter';
    voteheadBreakdown: Record<VoteHead, { allocated: number; paid: number }>;
    bursaryApplied: number;
    capitationReceived: number;
  };
  assessments: Record<string, SubjectAssessment>;
  competencies: {
    communication: number;
    criticalThinking: number;
    digitalLiteracy: number;
    citizenship: number;
    creativity: number;
    selfEfficacy: number;
  };
  valuesNotes: string;
  attendancePercent: number;
  specialNeedsCategory?: string;
}

export interface BursaryRecord {
  id: string;
  source:
    | 'NG-CDF Limuru'
    | 'Kiambu County Education Fund'
    | 'Presidential Secondary Bursary'
    | 'MoE Capitation (FPE/FDSE)'
    | 'Equity Wings to Fly'
    | 'KCB Foundation';
  learnerId: string;
  learnerName: string;
  admissionNo: string;
  grade: GradeLevel;
  amount: number;
  chequeVoucherNo: string;
  date: string;
  term: 'Term 1' | 'Term 2' | 'Term 3';
  status: 'Disbursed' | 'Approved' | 'Audited';
}

export interface DarajaMpesaPayment {
  transId: string;
  billRefNumber: string; // Admission Number e.g. LMS/2026/0101
  msisdn: string; // Safaricom Phone
  firstName: string;
  middleName?: string;
  lastName?: string;
  transAmount: number;
  transTime: string;
  matchedLearnerId?: string;
  matchedLearnerName?: string;
  allocatedVotehead: VoteHead;
  receiptNumber: string;
  smsStatus?: 'Sent' | 'Pending' | 'Failed';
  status?: 'Confirmed' | 'Pending' | 'Flagged';
  rawPayload?: string;
}

export interface SMSBroadcast {
  id: string;
  type: 'Fee Reminder' | 'Academic Report' | 'AGM & Parents Meeting' | 'Emergency Alert' | 'General Notice';
  message: string;
  recipientsCount: number;
  targetGrade: 'All Grades' | GradeLevel;
  timestamp: string;
  deliveryRate: number;
  status: 'Delivered' | 'Queued' | 'Sent';
}

export interface PayrollEmployee {
  id: string;
  tscOrIdNo: string;
  name: string;
  role: string;
  cadre: 'TSC Permanent' | 'BoM Contract' | 'Support Staff';
  basicSalary: number;
  houseAllowance: number;
  commuterAllowance: number;
  grossPay: number;
  paye: number;
  shaNhif: number;
  nssf: number;
  housingLevy: number;
  netPay: number;
  month: string;
  status: 'Approved' | 'Paid';
}

export interface AssetItem {
  id: string;
  name: string;
  category:
    | 'Science Lab Chemical / Apparatus'
    | 'ICT & Computer Lab'
    | 'Sports Equipment'
    | 'Furniture & Fixtures'
    | 'Boarding Facility / Dorm'
    | 'Agriculture Tools';
  serialOrTag: string;
  location: string;
  quantity: number;
  unit: string;
  condition: 'Operational / Good' | 'Needs Repair' | 'Damaged / Disposed';
  custodianStaff: string;
  lastAudited: string;
}

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  period: number;
  time: string;
  grade: GradeLevel;
  stream: string;
  subject: string;
  teacher: string;
  room: string;
}

export interface LearningAreaDefinition {
  id: string;
  code: string;
  name: string;
  leadTeacher: string;
  strands: string[];
  applicableSections: SchoolSection[];
}

export interface TeacherStaffRecord {
  id: string;
  name: string;
  tscOrIdNo: string;
  nationalId: string;
  phone: string;
  email: string;
  cadre: 'TSC Permanent' | 'BoM Contract' | 'TSC Intern' | 'Support Staff';
  role: 'Class Master' | 'Subject Teacher' | 'HOD' | 'Deputy Principal' | 'Senior Teacher';
  assignedGrade?: GradeLevel;
  assignedStream?: string;
  assignedSubjects: string[];
  dateOfJoining: string;
  basicSalary: number;
  qualification: string;
  status: 'Active' | 'On Leave' | 'Seconded';
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action:
    | 'DATA_EXPORT_EXCEL'
    | 'KEMIS_SYNC'
    | 'PII_DECRYPT_VIEW'
    | 'PII_ENCRYPT_TOGGLE'
    | 'MARKSHEET_DOWNLOAD'
    | 'FEE_LEDGER_EXPORT'
    | 'AUTH_LOGIN'
    | 'AUTH_SIGNUP'
    | 'TEACHER_ONBOARDED'
    | 'FLEET_FUEL_LOG'
    | 'FEE_REMINDER_SMS'
    | 'CLASS_STREAM_RENAMED'
    | 'TPAD_APPRAISAL_SIGN'
    | 'MOE_SUPER_LOGIN'
    | 'MOE_CAPITATION_DISBURSE'
    | 'MOE_TRANSFER_DECISION'
    | 'MOE_SCHOOL_APPROVAL'
    | 'MOE_INSPECTION_AUDIT'
    | 'MOE_COMPLIANCE_EDIT';
  targetResource: string;
  details: string;
  ipAddress: string;
  sensitivityLevel: 'Confidential' | 'Restricted' | 'General';
}

export interface KiambuSchoolRecord {
  id: string;
  name: string;
  centerCode: string; // e.g. "20401823"
  subCounty: string; // e.g. "Limuru", "Kiambu", "Thika", "Ruiru", "Kikuyu", "Lari", "Gatundu South"
  category: 'Public Comprehensive' | 'Private Academy' | 'SNE Approved Special School';
  levelsOffered: string[]; // e.g. ['Grade 1-6 Primary', 'Grade 7-9 JSS']
  principalName: string;
  contactPhone: string;
  enrolledLearners: number;
  verifiedKemisHeadcount: number;
  fpeFdjseCapitationTerm1: number;
  disbursementStatus: 'Disbursed' | 'Approved - Pending Treasury' | 'Audited - Flagged Variance';
  transferRequestsCount: number;
  kpseaCandidateCount: number;
  kjseaCandidateCount: number;
  complianceScore: number; // e.g. 96
  accreditationStatus: 'Fully Accredited' | 'Provisional 2026' | 'Under QASO Inspection';
  infrastructureGrantApproved: number;
  gpsCoordinates: string;
}

export interface MoeCapitationDisbursement {
  id: string;
  trancheNumber: string; // e.g. "FPE-FDJSE-2026-TR1-901"
  term: string; // e.g. "2026 Term 1 (50% Tranche)"
  schoolId: string;
  schoolName: string;
  subCounty: string;
  totalEligibleStudents: number;
  primaryCount: number;
  jssCount: number;
  totalAmountDisbursed: number;
  voteheadBreakdown: {
    tuitionTextbooks: number;
    operationsUtilities: number;
    repairsMaintenance: number;
    activityCoCurricular: number;
    smasseScienceKit: number;
  };
  treasuryVoucherRef: string;
  approvedBy: string;
  approvalDate: string;
  pkiDigitalSignatureSha256: string;
  status: 'Approved & Disbursed' | 'Awaiting CDE Sign-Off' | 'Flagged by Auditor';
}

export interface MoeTransferApproval {
  id: string;
  studentName: string;
  nemisUpi: string;
  grade: GradeLevel;
  fromSchoolName: string;
  fromCenterCode: string;
  toSchoolName: string;
  toCenterCode: string;
  reason: 'Parent Relocation' | 'Medical / Climate Needs' | 'Special Needs Placement' | 'Academic Talent Advancement';
  subCounty: string;
  county: string;
  status: 'Pending CDE Approval' | 'Approved by Ministry' | 'Rejected - Stream Capacity Exceeded';
  nemisClearanceCertNo: string;
  submissionDate: string;
  reviewedBy?: string;
  reviewDate?: string;
  digitalStampCode?: string;
}

export interface MoeSchoolMajorApproval {
  id: string;
  schoolName: string;
  centerCode: string;
  type:
    | 'JSS Laboratory Accreditation'
    | 'New Stream Addition'
    | 'BoM Charter Constitution'
    | 'Private School License Renewal'
    | 'Infrastructure Emergency Grant';
  details: string;
  submissionDate: string;
  status: 'Approved' | 'Under QASO Review' | 'Deferred';
  priority: 'High' | 'Normal' | 'Urgent';
  grantAmountKes?: number;
  approverOfficial?: string;
}

export type MoeAuthorityLevel =
  | 'Level 1: Sub-County QASO (Inspectorate)'
  | 'Level 2: Sub-County Director of Education (SCDE)'
  | 'Level 3: County Director of Education (CDE - Kiambu)'
  | 'Level 4: Regional Director of Education (RDE - Central)'
  | 'Level 5: Director General / Principal Secretary';

export interface MoeSigningOfficer {
  id: string;
  name: string;
  nationalId: string;
  badgeNumber: string;
  designation: string;
  level: MoeAuthorityLevel;
  subCounty: string; // e.g. "Limuru", "Kiambu Town", "All Kiambu County"
  signingPin: string; // e.g. "4921"
  certificateFingerprint: string; // e.g. "SHA256:7B:9A:...:2C"
  maxCapitationApprovalKes: number; // e.g. 50,000,000
  canApproveTransfers: boolean;
  canDisburseFunds: boolean;
  canGazetteSchools: boolean;
  canFreezeAudit: boolean;
  status: 'Active Authorized' | 'Suspended' | 'Revoked';
  lastSigningTimestamp?: string;
}

export type MoeReportCategory =
  | 'Enrollment & Learner Data'
  | 'Financial Management & Accountability'
  | 'Curriculum & Academic Performance'
  | 'Institutional Health, Safety & Governance';

export interface MoeStatutoryReport {
  id: string;
  category: MoeReportCategory;
  reportName:
    | 'NEMIS / Data Portal Updates'
    | 'Daily/Monthly Attendance & Admission Registers'
    | 'Transfer & Admission Forms'
    | 'Annual Audited Financial Statements'
    | 'Approved Annual Budget & Procurement Plan'
    | 'Stores & Fixed Asset Registers'
    | 'Schemes of Work & Records of Work Done'
    | 'National Exam Analysis & Assessment Returns'
    | 'Co-Curricular Progress Reports'
    | 'Safety & Infrastructure Standards Assessment'
    | 'School Logbook & Visitors\' Book'
    | 'Guidance, Counseling & Unrest Monitoring'
    | 'Punishment / Discipline Record';
  schoolName: string;
  centerCode: string;
  subCounty: string;
  academicYear: string;
  term: string;
  submissionDate: string;
  status: 'Verified & Endorsed' | 'Pending Review' | 'Flagged for Audit';
  keyContentsAndPurpose: string;
  whyCrucial: string;
  summaryMetrics: Record<string, string | number>;
  verifiedByOfficer?: string;
  complianceRatingPercent: number;
  officialRefNumber: string;
  uploadedFileName?: string;
  uploadedFileSize?: string;
  uploadedDate?: string;
  uploadedBy?: string;
  auditorName?: string;
  auditOpinion?: 'Unqualified Clean Opinion' | 'Qualified with Explanatory Notes' | 'Adverse / Material Discrepancy';
  budgetApprovedAmountKes?: number;
  bomMinuteRef?: string;
  syllabusCoveragePercent?: number;
  schemeOfWorkTerm?: string;
  editNotes?: string;
  lastEditedAt?: string;
  editedBy?: string;
}

// =========================================================================
// EXECUTIVE DIRECTIVE & AUDIT RETURNS DATA TYPES (ANTI-FRAUD & 100% TRANSITION)
// =========================================================================

export type CampusSuffixType = 'Primary Campus (_PS)' | 'Junior Secondary Campus (_JS)';

export interface InstitutionalSuffixAudit {
  id: string;
  baseCode: string; // e.g. "20401823"
  schoolName: string;
  suffixCode: string; // e.g. "20401823_PS" or "20401823_JS"
  campusType: CampusSuffixType;
  sharedRegistrationCertNo: string;
  sharedCompound: boolean;
  acreage: number;
  enrolledLearners: number;
  verifiedKemisHeadcount: number;
  ghostSchoolRiskIndex: 'Verified Clean Operational' | 'Variance Flagged' | 'Ghost Anomaly Suspect';
  separateDigitalLedgerMaintained: boolean;
  subCounty: string;
}

export interface KnecLearnerMappingRecord {
  id: string;
  studentName: string;
  nemisUpi: string;
  birthCertificateEntryNo: string;
  campusSuffix: CampusSuffixType;
  grade: GradeLevel;
  knecAssessmentIndexNo: string; // e.g. "20401823001"
  assessmentExamType: 'KPSEA (Grade 6)' | 'KJSEA (Grade 9)';
  mappingStatus: '100% Verified Mapped' | 'Unmapped Index Number' | 'UPI Discrepancy Flagged';
  capitationEligibility: boolean;
  remarks: string;
}

export interface TeacherWorkloadMatchingReturn {
  id: string;
  teacherName: string;
  tscNumber: string;
  campusSuffix: CampusSuffixType;
  primarySubject: string;
  secondarySubject: string;
  teachingLoadLessonsPerWeek: number; // Benchmark: 27 lessons
  utilizationStatus: 'Optimal Load (24-28)' | 'Under-Utilized (<22)' | 'Overloaded (>30)';
  staffingDeficitArea: 'None (Adequate)' | 'STEM Shortage' | 'Practical / Pre-Tech Deficit' | 'Language Arts Shortage';
  tpadScore: number; // 0 - 100%
  subCounty: string;
}

export interface StemLabFacilityReturn {
  id: string;
  schoolName: string;
  centerCode: string;
  campusSuffix: CampusSuffixType;
  integratedScienceLabStatus: 'Fully Equipped & Functional' | 'Deficient Reagents / Glassware' | 'Under Construction / Makeshift';
  functionalMicroscopes: number;
  defectiveMicroscopes: number;
  chemicalReagentsCertStatus: 'Certified Non-Hazardous' | 'Replenishment Due' | 'Expired Reagents Flagged';
  fumeExtractionSystem: boolean;
  functionalTabletsLaptops: number;
  learnerToDeviceRatio: string;
  powerGridStatus: 'KPLC Grid Functional' | 'Solar Power + Battery Backup' | 'Off-Grid Deficit';
  connectivityType: 'Optic Fiber BroadBand' | '4G LTE Dedicated' | 'No Internet Connection';
  tvetPreTechWorkshopStatus: 'Functional Equipment Kits' | 'Basic Tools Only' | 'Non-Compliant';
  subCounty: string;
}

export interface SanitationRatioReturn {
  id: string;
  schoolName: string;
  centerCode: string;
  campusSuffix: CampusSuffixType;
  totalBoys: number;
  totalGirls: number;
  boysLatrinesToilets: number;
  girlsLatrinesToilets: number;
  boyToToiletRatio: string; // MoE Benchmark 1:30
  girlToToiletRatio: string; // MoE Benchmark 1:25
  totalClassrooms: number;
  learnerToClassroomRatio: string; // MoE Benchmark 1:45
  sanitationCompliance: 'Fully Compliant' | 'Overcrowded - Public Health Risk';
  handwashingPointsServiced: number;
  subCounty: string;
}

export interface CapitationReconciliationReturn {
  id: string;
  schoolName: string;
  centerCode: string;
  campusSuffix: CampusSuffixType;
  academicYearTerm: string;
  expectedFundingKes: number;
  actualDisbursedKes: number;
  shortfallDebtCarriedKes: number;
  officialReceiptVoucherRef: string;
  receiptUploadStatus: 'Uploaded & Reconciled' | 'Pending Receipt Upload';
  scdeVerifiedBank: string; // e.g. "KCB Bank Kenya - Limuru Branch"
  bankAccountMasked: string; // e.g. "••••••••1109"
  bankVerificationStatus: 'SCDE Verified & Locked' | 'Pending Signature Validation';
  tuitionVoteheadKes: number;
  operationsVoteheadKes: number;
  rmiVoteheadKes: number;
}

export interface UniformCostControlReturn {
  id: string;
  schoolName: string;
  centerCode: string;
  compulsoryItemsList: string[]; // e.g. "2 Shirts, 2 Skirts/Shorts, 1 Sweater, 1 Tracksuit"
  schoolPackageTotalCostKes: number;
  ministryCeilingGuidelineKes: number; // e.g. KES 3,500
  commercializationStatus: 'Compliant with Price Cap' | 'Commercialization Alert Flagged';
  subCounty: string;
}

export interface SneAssessmentReturn {
  id: string;
  learnerName: string;
  nemisUpi: string;
  schoolName: string;
  campusSuffix: CampusSuffixType;
  earcReportNumber: string; // Educational Assessment & Resource Centre No.
  disabilityCategory: 'Visual Impairment' | 'Hearing Impairment' | 'Physical Disability' | 'Autism Spectrum' | 'Intellectual / Multiple';
  approvedSNEGrantPerAnnumKes: number; // e.g. KES 4,500
  assessmentOfficer: string;
  verificationStatus: 'EARC Validated' | 'Pending Assessment Review';
}

export interface ComprehensiveSafetyReturn {
  id: string;
  schoolName: string;
  centerCode: string;
  campusSuffix: CampusSuffixType;
  fireSafetyCertNumber: string;
  fireExtinguishersCount: number;
  lastServicingDate: string;
  emergencyExitsFunctional: boolean;
  dormitoryDoorMechanism: 'Outward-Opening Panic Bolts (Compliant)' | 'Inward-Opening Hazard (Violation)';
  perimeterMasonryFenceStatus: '100% Secured with Manned Gate' | 'Partial Fence Deficit';
  countyFireMarshalSignOffDate: string;
  psychosocialIncidentsLoggedCount: number;
  bullyingPreventionPolicyActive: boolean;
  subCounty: string;
}

export interface SeniorTransitionComplianceReturn {
  id: string;
  learnerName: string;
  nemisUpi: string;
  juniorSchoolOrigin: string;
  seniorSchoolAssigned: string;
  admissionStatus: 'Admitted Unconditionally (100% Transition)' | 'Active Non-Reporting Flagged' | 'Financial Levies Barrier Resolved';
  feeLeviesWaived: boolean;
  uniformFlexibilityGranted: boolean; // Allowed to report in previous uniform/civilian wear
  subCountyOfficerAction: string;
  reportingDate: string;
}

export interface PriorityActionItem {
  id: string;
  priorityArea: 'Data Verification' | 'Infrastructure' | 'Finance' | 'Welfare & Safety';
  essentialReportReturn: string;
  targetRecipient: string;
  status: 'Critical Action Active' | 'Review Completed' | 'Enforcement Dispatched';
  dueNotice: string;
}

export interface StreamClassConfig {
  grade: GradeLevel;
  streamName: string; // e.g. "7 Amboseli"
  alias?: string;     // e.g. "Grade 7 East"
  classTeacherName?: string;
  capacity?: number;
}

export interface FuelFleetVehicle {
  id: string;
  registrationNumber: string; // e.g. KBZ 419P
  makeModel: string; // e.g. Isuzu FVR 51-Seater
  capacity: number; // seats
  assignedDriver: string;
  driverPhone: string;
  currentOdometerKm: number;
  fuelType: 'Diesel' | 'Super Petrol';
  fuelTankCapacityLiters: number;
  currentFuelLevelPercent: number;
  status: 'Active on Route' | 'In Depot' | 'Under Maintenance';
  speedGovernorCertExpiry: string;
  insuranceExpiry: string;
  nextServiceMileageKm: number;
}

export interface BusRoute {
  id: string;
  name: string; // e.g. Route A: Limuru - Banana - Ruaka
  vehicleId: string;
  vehiclePlate: string;
  driverName: string;
  driverPhone: string;
  morningDeparture: string;
  eveningReturn: string;
  stops: string[];
  distanceKmPerRoundTrip: number;
  monthlyFuelBudgetLiters: number;
  enrolledStudentsCount: number;
}

export interface FuelLogEntry {
  id: string;
  date: string;
  vehicleId: string;
  vehiclePlate: string;
  driverName: string;
  startOdometerKm: number;
  endOdometerKm: number;
  distanceCoveredKm: number;
  litersPumped: number;
  fuelRatePerLiter: number; // KES e.g. 182.50
  totalCostKes: number;
  receiptNumber: string;
  stationName: string; // e.g. TotalEnergies Limuru
  fuelEfficiencyKmPerLiter: number; // calculated
  isLeakageFlagged: boolean; // flags consumption variance >20%
}

export interface VehicleMaintenanceRecord {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  date: string;
  serviceType:
    | 'Routine 5,000km Service'
    | 'Brake Overhaul'
    | 'Tire Replacement'
    | 'NTSA Speed Governor Inspection'
    | 'Suspension / Spring Bush';
  mileageAtService: number;
  garageName: string;
  costKes: number;
  technicianNotes: string;
  status: 'Completed' | 'Scheduled' | 'Pending Parts';
}

export interface StudentTransportBooking {
  id: string;
  learnerId: string;
  learnerName: string;
  grade: GradeLevel;
  stream: string;
  routeId: string;
  routeName: string;
  pickupDropoffStop: string;
  parentPhone: string;
  termTransportFee: number;
  feeStatus: 'Paid' | 'Pending';
}

export interface KemisTransferRecord {
  id: string;
  learnerId: string;
  learnerName: string;
  nemisUpi: string;
  grade: GradeLevel;
  transferType: 'Incoming Transfer' | 'Outgoing Transfer';
  targetSchoolName: string;
  targetSchoolCode: string; // MoE Center code
  subCounty: string;
  county: string;
  releaseLetterRef: string;
  effectiveDate: string;
  approvalStatus: 'Approved by Sub-County Director' | 'Pending BoM Approval' | 'Synchronized on NEMIS';
}
