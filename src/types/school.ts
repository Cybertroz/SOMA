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

export type UserRole = 'principal' | 'bursar' | 'class_master' | 'teacher' | 'parent';

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
  | 'view_audit_logs';

export interface AuthUser {
  id: string;
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
  transAmount: number;
  transTime: string;
  matchedLearnerId?: string;
  matchedLearnerName?: string;
  allocatedVotehead: VoteHead;
  receiptNumber: string;
  smsStatus: 'Sent' | 'Pending' | 'Failed';
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
    | 'FLEET_FUEL_LOG';
  targetResource: string;
  details: string;
  ipAddress: string;
  sensitivityLevel: 'Confidential' | 'Restricted' | 'General';
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
