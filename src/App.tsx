/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  GraduationCap,
  Utensils,
  CreditCard,
  BarChart3,
  UserCheck,
  Printer,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  ScanLine,
  Receipt,
  Award,
  FileText,
  Check,
  X,
  ChevronRight,
  Volume2,
  VolumeX,
  Filter,
  Calendar,
  Clock,
  ShieldAlert,
  Users,
  BookOpen,
  HeartPulse,
  Sparkles,
  Download,
  School,
  ArrowUpRight,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Warehouse,
  FileSpreadsheet,
} from 'lucide-react';
import { KitchenInventory } from './components/KitchenInventory';
import { TextbookStationeryPlatform } from './components/TextbookStationeryPlatform';
import { exportToExcel } from './utils/excelExport';

/* =========================================================================
   TYPE DEFINITIONS (Kenyan JSS & CBC Standard)
   ========================================================================= */

export type CBCLevel = 'EE' | 'ME' | 'AE' | 'BE';

export interface SubjectAssessment {
  formative: CBCLevel;
  summativeScore: number; // 0 - 100
  level: CBCLevel;
  remarks: string;
}

export interface Student {
  id: string;
  nemisUpi: string;
  assessmentNo: string;
  name: string;
  gender: 'Male' | 'Female';
  grade: 'Grade 7' | 'Grade 8' | 'Grade 9';
  stream: string;
  dob: string;
  guardianName: string;
  guardianPhone: string;
  smartCardUid: string;
  mealPlan: {
    active: boolean;
    tier: 'Full Day Scholar' | 'Boarder' | 'Breakfast Only';
    dietaryTags: string[];
    allergyWarning?: string;
  };
  fees: {
    totalTermFee: number;
    paidAmount: number;
    balance: number;
    status: 'Cleared' | 'Partial' | 'Defaulter';
  };
  assessments: Record<string, SubjectAssessment>;
  competencies: {
    communication: number; // 1-5
    criticalThinking: number;
    digitalLiteracy: number;
    citizenship: number;
    creativity: number;
    selfEfficacy: number;
  };
  valuesNotes: string;
  coCurricular: string;
  attendancePercent: number;
}

export interface LearningArea {
  id: string;
  name: string;
  code: string;
  strands: string[];
  leadTeacher: string;
}

export type MealSession = 'Morning Porridge' | '10 AM Tea Break' | 'Midday Lunch' | '4 PM Tea' | 'Boarder Dinner';

export interface MealLog {
  id: string;
  studentId: string;
  studentName: string;
  nemisUpi: string;
  grade: string;
  stream: string;
  session: MealSession;
  timestamp: string;
  dishServed: string;
  dietaryTags: string[];
  flaggedAllergy?: string;
  serverStaff: string;
}

export interface FeeTransaction {
  id: string;
  mpesaCode: string;
  studentId: string;
  studentName: string;
  nemisUpi: string;
  amount: number;
  channel: 'M-PESA Paybill' | 'M-PESA Till' | 'Direct Bank Deposit' | 'NCBA / KCB Agent';
  payerPhone: string;
  payerName: string;
  date: string;
  receiptNumber: string;
}

export interface TeacherTPAD {
  id: string;
  tscNumber: string;
  name: string;
  role: string;
  subjects: string[];
  grades: string[];
  tpadScore: number; // 1.0 - 5.0
  syllabusCoverage: number; // percentage
  lessonPlansUploaded: number;
  lessonPlansTarget: number;
  remedialSessionsCount: number;
  cbRubricFidelity: number; // %
  standards: {
    professionalKnowledge: number; // out of 5
    learnerAssessment: number;
    professionalGrowth: number;
    remedialAndInclusion: number;
    safetyAndEthics: number;
  };
  observationNotes: string;
  status: 'Completed' | 'Pending Review' | 'In Progress';
}

/* =========================================================================
   AUDIO FEEDBACK SYNTHESIZER (NFC Tap & M-Pesa chimes via Web Audio API)
   ========================================================================= */

function playSound(type: 'tap-success' | 'tap-error' | 'mpesa-success' | 'click') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'tap-success') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'tap-error') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'mpesa-success') {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        const start = ctx.currentTime + idx * 0.08;
        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.16);
        osc.start(start);
        osc.stop(start + 0.16);
      });
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    }
  } catch (err) {
    // Audio context may require user interaction
  }
}

/* =========================================================================
   STANDARD KENYAN LEARNING AREAS (KICD / MoE JSS Curriculum)
   ========================================================================= */

const JSS_LEARNING_AREAS: LearningArea[] = [
  {
    id: 'eng',
    name: 'English',
    code: 'ENG-JSS',
    strands: ['Listening and Speaking', 'Reading Fluency & Comprehension', 'Grammar in Use', 'Creative Writing'],
    leadTeacher: 'Mdm. Grace Ndung’u (TSC/412891)',
  },
  {
    id: 'kis',
    name: 'Kiswahili',
    code: 'KIS-JSS',
    strands: ['Kusikiliza na Kuzungumza', 'Kusoma kwa Ufahamu', 'Sarufi', 'Kuandika Insha'],
    leadTeacher: 'Mwalimu James Otieno (TSC/389211)',
  },
  {
    id: 'mat',
    name: 'Mathematics',
    code: 'MAT-JSS',
    strands: ['Numbers & Algebra', 'Measurement & Geometry', 'Data Handling & Probability', 'Financial Literacy'],
    leadTeacher: 'Mr. Boniface Kipchumba (TSC/502144)',
  },
  {
    id: 'sci',
    name: 'Integrated Science',
    code: 'SCI-JSS',
    strands: ['Living Things & Environment', 'Matter & Energy', 'Forces & Simple Machines', 'Human Health & Physiology'],
    leadTeacher: 'Dr. Anne Wanjala (TSC/471092)',
  },
  {
    id: 'agr',
    name: 'Agriculture & Nutrition',
    code: 'AGR-JSS',
    strands: ['Crop Production & Soil Health', 'Animal Rearing', 'Food Preservation', 'Nutritional Meal Planning'],
    leadTeacher: 'Mr. Dennis Wekesa (TSC/520441)',
  },
  {
    id: 'pre_tech',
    name: 'Pre-Technical & Pre-Career Studies',
    code: 'PTS-JSS',
    strands: ['Technical Drawing', 'Safety & Tools', 'Materials (Wood, Metal, Plastics)', 'Basic Electricity & Coding'],
    leadTeacher: 'Eng. Kennedy Mutua (TSC/493820)',
  },
  {
    id: 'soc',
    name: 'Social Studies',
    code: 'SOC-JSS',
    strands: ['Physical Environment of Kenya', 'People & Population', 'Governance & Kenyan Constitution', 'Historical Heritage'],
    leadTeacher: 'Mdm. Farida Mohamed (TSC/439201)',
  },
  {
    id: 'cre_ire',
    name: 'Religious Education (CRE/IRE)',
    code: 'RE-JSS',
    strands: ['Creation & Moral Living', 'Biblical/Quranic Teachings', 'Family Values & Community Service', 'Peace & Reconciliation'],
    leadTeacher: 'Pastor Peter Njoroge (TSC/401923)',
  },
  {
    id: 'arts_sports',
    name: 'Creative Arts & Sports',
    code: 'CAS-JSS',
    strands: ['Visual Arts & Design', 'Music & Traditional Dance', 'Athletics & Ball Games', 'Gymnastics & First Aid'],
    leadTeacher: 'Coach Sharon Kiprop (TSC/518902)',
  },
];

/* Helper to convert score to CBC level */
function scoreToCBCLevel(score: number): CBCLevel {
  if (score >= 80) return 'EE';
  if (score >= 65) return 'ME';
  if (score >= 50) return 'AE';
  return 'BE';
}

function getCBCLevelDescription(level: CBCLevel): { label: string; range: string; color: string; bg: string; text: string } {
  switch (level) {
    case 'EE':
      return { label: 'Exceeding Expectations', range: '80% - 100%', color: '#059669', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', text: 'text-emerald-700' };
    case 'ME':
      return { label: 'Meeting Expectations', range: '65% - 79%', color: '#0284c7', bg: 'bg-sky-50 text-sky-800 border-sky-200', text: 'text-sky-700' };
    case 'AE':
      return { label: 'Approaching Expectations', range: '50% - 64%', color: '#d97706', bg: 'bg-amber-50 text-amber-800 border-amber-200', text: 'text-amber-700' };
    case 'BE':
      return { label: 'Below Expectations', range: '0% - 49%', color: '#dc2626', bg: 'bg-rose-50 text-rose-800 border-rose-200', text: 'text-rose-700' };
  }
}

/* =========================================================================
   INITIAL KENYAN JSS SEED DATA
   ========================================================================= */

const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std_01',
    nemisUpi: 'NEMIS-7849201',
    assessmentNo: 'KNEC/JSS/2026/0412',
    name: 'Brian Omondi Odhiambo',
    gender: 'Male',
    grade: 'Grade 8',
    stream: '8 Tsavo',
    dob: '2012-04-18',
    guardianName: 'Grace Auma (Mother)',
    guardianPhone: '+254 722 890 144',
    smartCardUid: 'NFC-8842-JSS',
    mealPlan: {
      active: true,
      tier: 'Full Day Scholar',
      dietaryTags: ['Standard Meal', 'No Peanuts'],
      allergyWarning: 'Severe Peanut Anaphylaxis Alert',
    },
    fees: {
      totalTermFee: 28500,
      paidAmount: 28500,
      balance: 0,
      status: 'Cleared',
    },
    assessments: {
      eng: { formative: 'EE', summativeScore: 84, level: 'EE', remarks: 'Outstanding creative essay composition and active debating skills.' },
      kis: { formative: 'ME', summativeScore: 78, level: 'ME', remarks: 'Ufasaha mzuri katika sarufi na kusoma kwa ufahamu.' },
      mat: { formative: 'EE', summativeScore: 92, level: 'EE', remarks: 'Exceptional algebraic deduction and problem formulation.' },
      sci: { formative: 'ME', summativeScore: 76, level: 'ME', remarks: 'Very inquisitive during human organ system laboratory dissection.' },
      agr: { formative: 'EE', summativeScore: 85, level: 'EE', remarks: 'Led school drip irrigation demo bed project with distinction.' },
      pre_tech: { formative: 'ME', summativeScore: 74, level: 'ME', remarks: 'Demonstrates safe workshop handling and neat isometric sketches.' },
      soc: { formative: 'ME', summativeScore: 71, level: 'ME', remarks: 'Good grasp of county governance structures in Kenya.' },
      cre_ire: { formative: 'EE', summativeScore: 88, level: 'EE', remarks: 'High demonstration of compassion, integrity, and peer support.' },
      arts_sports: { formative: 'EE', summativeScore: 86, level: 'EE', remarks: 'First choice goalkeeper for sub-county JSS soccer squad.' },
    },
    competencies: {
      communication: 5,
      criticalThinking: 5,
      digitalLiteracy: 4,
      citizenship: 4,
      creativity: 4,
      selfEfficacy: 5,
    },
    valuesNotes: 'Exhibits exemplary honesty and respect towards teachers and peers.',
    coCurricular: 'Scouts Patrol Leader, Football Team Captain, Environmental Club',
    attendancePercent: 98,
  },
  {
    id: 'std_02',
    nemisUpi: 'NEMIS-9104823',
    assessmentNo: 'KNEC/JSS/2026/0413',
    name: 'Wanjiku Faith Mwangi',
    gender: 'Female',
    grade: 'Grade 8',
    stream: '8 Tsavo',
    dob: '2012-08-09',
    guardianName: 'Peter Mwangi Kamau (Father)',
    guardianPhone: '+254 710 432 990',
    smartCardUid: 'NFC-4491-JSS',
    mealPlan: {
      active: true,
      tier: 'Full Day Scholar',
      dietaryTags: ['Vegetarian Option', 'Lactose Intolerant'],
      allergyWarning: 'Strict Dairy/Milk Free',
    },
    fees: {
      totalTermFee: 28500,
      paidAmount: 20000,
      balance: 8500,
      status: 'Partial',
    },
    assessments: {
      eng: { formative: 'EE', summativeScore: 89, level: 'EE', remarks: 'Masterful vocabulary, won Eastlands zonal poetry recitation.' },
      kis: { formative: 'EE', summativeScore: 86, level: 'EE', remarks: 'Mchango mzuri sana kwenye mijadala ya darasa.' },
      mat: { formative: 'ME', summativeScore: 72, level: 'ME', remarks: 'Solid understanding of geometry and angles.' },
      sci: { formative: 'EE', summativeScore: 84, level: 'EE', remarks: 'Prepared winning science congress model on renewable biogas.' },
      agr: { formative: 'ME', summativeScore: 76, level: 'ME', remarks: 'Knowledgeable in crop pest biological management.' },
      pre_tech: { formative: 'ME', summativeScore: 70, level: 'ME', remarks: 'Capable handling of electronic components and circuits.' },
      soc: { formative: 'EE', summativeScore: 85, level: 'EE', remarks: 'Insightful understanding of African traditional diplomacy.' },
      cre_ire: { formative: 'ME', summativeScore: 79, level: 'ME', remarks: 'Regular voluntary participation in chaplaincy services.' },
      arts_sports: { formative: 'EE', summativeScore: 88, level: 'EE', remarks: 'Pianist for school choir and top sprinter in 200m track.' },
    },
    competencies: {
      communication: 5,
      criticalThinking: 4,
      digitalLiteracy: 5,
      citizenship: 5,
      creativity: 5,
      selfEfficacy: 4,
    },
    valuesNotes: 'Displays natural leadership, empathy, and deep civic duty.',
    coCurricular: 'Journalism Club Chairperson, Music Choir Soloist',
    attendancePercent: 96,
  },
  {
    id: 'std_03',
    nemisUpi: 'NEMIS-6302914',
    assessmentNo: 'KNEC/JSS/2026/0414',
    name: 'Kevin Kiprono Cheruiyot',
    gender: 'Male',
    grade: 'Grade 7',
    stream: '7 Mara',
    dob: '2013-02-14',
    guardianName: 'Beatrice Chepkemoi (Aunt)',
    guardianPhone: '+254 723 118 702',
    smartCardUid: 'NFC-2019-JSS',
    mealPlan: {
      active: true,
      tier: 'Boarder',
      dietaryTags: ['Standard Meal', 'Halal Compliant'],
    },
    fees: {
      totalTermFee: 36000,
      paidAmount: 14000,
      balance: 22000,
      status: 'Defaulter',
    },
    assessments: {
      eng: { formative: 'ME', summativeScore: 68, level: 'ME', remarks: 'Demonstrates steady progress in reading comprehension.' },
      kis: { formative: 'AE', summativeScore: 58, level: 'AE', remarks: 'Inahitaji mazoezi zaidi ya msamiati na uakifishaji.' },
      mat: { formative: 'AE', summativeScore: 54, level: 'AE', remarks: 'Needs targeted reinforcement in fractions and decimals.' },
      sci: { formative: 'ME', summativeScore: 66, level: 'ME', remarks: 'Enjoys outdoor specimen collection and botanical sketches.' },
      agr: { formative: 'ME', summativeScore: 70, level: 'ME', remarks: 'Active engagement in school poultry keeping project.' },
      pre_tech: { formative: 'AE', summativeScore: 59, level: 'AE', remarks: 'Needs practice with fine woodcarving measurements.' },
      soc: { formative: 'ME', summativeScore: 65, level: 'ME', remarks: 'Knows major Kenyan relief features and climatic zones.' },
      cre_ire: { formative: 'ME', summativeScore: 68, level: 'ME', remarks: 'Regular attendance and respectful attitude.' },
      arts_sports: { formative: 'EE', summativeScore: 82, level: 'EE', remarks: 'Talented 1500m distance runner representing school.' },
    },
    competencies: {
      communication: 3,
      criticalThinking: 3,
      digitalLiteracy: 3,
      citizenship: 4,
      creativity: 4,
      selfEfficacy: 3,
    },
    valuesNotes: 'Respectful student, benefits greatly from evening study hall.',
    coCurricular: 'Athletics Club, Young Farmers Association',
    attendancePercent: 92,
  },
  {
    id: 'std_04',
    nemisUpi: 'NEMIS-8201955',
    assessmentNo: 'KNEC/JSS/2026/0415',
    name: 'Amina Hassan Noor',
    gender: 'Female',
    grade: 'Grade 9',
    stream: '9 Turkana',
    dob: '2011-11-20',
    guardianName: 'Hassan Noor Abdi (Father)',
    guardianPhone: '+254 799 402 119',
    smartCardUid: 'NFC-7718-JSS',
    mealPlan: {
      active: true,
      tier: 'Boarder',
      dietaryTags: ['Halal Only', 'No Fish/Seafood Allergy'],
      allergyWarning: 'Mild Seafood Allergy',
    },
    fees: {
      totalTermFee: 36000,
      paidAmount: 36000,
      balance: 0,
      status: 'Cleared',
    },
    assessments: {
      eng: { formative: 'EE', summativeScore: 91, level: 'EE', remarks: 'Fluent speaker, represents school at Model UN youth sessions.' },
      kis: { formative: 'EE', summativeScore: 88, level: 'EE', remarks: 'Lugha sanifu yenye upeo wa juu na msamiati mpana.' },
      mat: { formative: 'EE', summativeScore: 87, level: 'EE', remarks: 'Rapid mathematical reasoning in commercial arithmetic.' },
      sci: { formative: 'EE', summativeScore: 90, level: 'EE', remarks: 'Deep understanding of genetics and cellular biology.' },
      agr: { formative: 'ME', summativeScore: 78, level: 'ME', remarks: 'Good practical handling of organic compost preparation.' },
      pre_tech: { formative: 'EE', summativeScore: 86, level: 'EE', remarks: 'Designed automated plant soil moisture monitor on Arduino.' },
      soc: { formative: 'EE', summativeScore: 92, level: 'EE', remarks: 'Distinguished essay on Kenyan East African Community integration.' },
      cre_ire: { formative: 'EE', summativeScore: 94, level: 'EE', remarks: 'Exemplary Islamic religious knowledge and Arabic recitations.' },
      arts_sports: { formative: 'ME', summativeScore: 75, level: 'ME', remarks: 'Excellent badminton and volleyball player.' },
    },
    competencies: {
      communication: 5,
      criticalThinking: 5,
      digitalLiteracy: 5,
      citizenship: 5,
      creativity: 4,
      selfEfficacy: 5,
    },
    valuesNotes: 'Elected Head Girl for 2026. Models integrity, resilience, and inclusivity.',
    coCurricular: 'School President, Debate Society, Red Cross First Aider',
    attendancePercent: 99,
  },
  {
    id: 'std_05',
    nemisUpi: 'NEMIS-5192804',
    assessmentNo: 'KNEC/JSS/2026/0416',
    name: 'Emmanuel Kiprop Korir',
    gender: 'Male',
    grade: 'Grade 9',
    stream: '9 Turkana',
    dob: '2011-06-30',
    guardianName: 'Lucy Jepkosgei (Mother)',
    guardianPhone: '+254 728 554 210',
    smartCardUid: 'NFC-3390-JSS',
    mealPlan: {
      active: true,
      tier: 'Full Day Scholar',
      dietaryTags: ['Standard Meal'],
    },
    fees: {
      totalTermFee: 28500,
      paidAmount: 28500,
      balance: 0,
      status: 'Cleared',
    },
    assessments: {
      eng: { formative: 'ME', summativeScore: 75, level: 'ME', remarks: 'Consistent improvement in structural grammar.' },
      kis: { formative: 'ME', summativeScore: 72, level: 'ME', remarks: 'Uchambuzi mzuri wa hadithi fupi za Kiswahili.' },
      mat: { formative: 'EE', summativeScore: 89, level: 'EE', remarks: 'Top scores in algebraic equations and coordinate geometry.' },
      sci: { formative: 'EE', summativeScore: 85, level: 'EE', remarks: 'Keen analytical thinker in physics and mechanics.' },
      agr: { formative: 'ME', summativeScore: 77, level: 'ME', remarks: 'Demonstrates good tractor implements knowledge.' },
      pre_tech: { formative: 'EE', summativeScore: 91, level: 'EE', remarks: 'Superb 3D rendering and wood joinery craftsmanship.' },
      soc: { formative: 'ME', summativeScore: 70, level: 'ME', remarks: 'Good grasp of mineral exploitation in Kenya.' },
      cre_ire: { formative: 'ME', summativeScore: 74, level: 'ME', remarks: 'Punctual and cooperative in group assignments.' },
      arts_sports: { formative: 'EE', summativeScore: 85, level: 'EE', remarks: 'High jump champion and basketball point guard.' },
    },
    competencies: {
      communication: 4,
      criticalThinking: 5,
      digitalLiteracy: 4,
      citizenship: 4,
      creativity: 4,
      selfEfficacy: 4,
    },
    valuesNotes: 'Shows humility, diligence, and helpful attitude to junior pupils.',
    coCurricular: 'Robotics Club, Basketball Team, St. John Ambulance',
    attendancePercent: 97,
  },
  {
    id: 'std_06',
    nemisUpi: 'NEMIS-3401928',
    assessmentNo: 'KNEC/JSS/2026/0417',
    name: 'Blessing Muthoni Githinji',
    gender: 'Female',
    grade: 'Grade 7',
    stream: '7 Amboseli',
    dob: '2013-09-12',
    guardianName: 'Samuel Githinji Ndung’u (Father)',
    guardianPhone: '+254 711 902 388',
    smartCardUid: 'NFC-1904-JSS',
    mealPlan: {
      active: true,
      tier: 'Full Day Scholar',
      dietaryTags: ['Standard Meal', 'Gluten Sensitive'],
      allergyWarning: 'Gluten Intolerance - Avoid Wheat Chapati',
    },
    fees: {
      totalTermFee: 28500,
      paidAmount: 18000,
      balance: 10500,
      status: 'Partial',
    },
    assessments: {
      eng: { formative: 'ME', summativeScore: 77, level: 'ME', remarks: 'Reads widely, expressive voice in drama sketches.' },
      kis: { formative: 'ME', summativeScore: 74, level: 'ME', remarks: 'Mwenendo mzuri katika utunzi wa mashairi.' },
      mat: { formative: 'ME', summativeScore: 69, level: 'ME', remarks: 'Good grasp of perimeter, area and volume.' },
      sci: { formative: 'ME', summativeScore: 78, level: 'ME', remarks: 'Very inquisitive in laboratory safety protocols.' },
      agr: { formative: 'EE', summativeScore: 82, level: 'EE', remarks: 'Excellent maintenance of kitchen garden spinach beds.' },
      pre_tech: { formative: 'ME', summativeScore: 71, level: 'ME', remarks: 'Neat freehand technical sketches.' },
      soc: { formative: 'ME', summativeScore: 73, level: 'ME', remarks: 'Active contributor in discussions on national unity.' },
      cre_ire: { formative: 'EE', summativeScore: 84, level: 'EE', remarks: 'Demonstrates kindness and helpfulness to others.' },
      arts_sports: { formative: 'EE', summativeScore: 89, level: 'EE', remarks: 'Talented textile weaver and active netball attacker.' },
    },
    competencies: {
      communication: 4,
      criticalThinking: 4,
      digitalLiteracy: 4,
      citizenship: 4,
      creativity: 5,
      selfEfficacy: 4,
    },
    valuesNotes: 'Respectful, always tidy and encourages classmates in peer study.',
    coCurricular: 'Art & Craft Club, Netball Team, Wildlife Club',
    attendancePercent: 95,
  },
  {
    id: 'std_07',
    nemisUpi: 'NEMIS-4820199',
    assessmentNo: 'KNEC/JSS/2026/0418',
    name: 'Denis Wafula Simiyu',
    gender: 'Male',
    grade: 'Grade 8',
    stream: '8 Serengeti',
    dob: '2012-01-25',
    guardianName: 'Mama Denis Simiyu (Mother)',
    guardianPhone: '+254 725 330 891',
    smartCardUid: 'NFC-6022-JSS',
    mealPlan: {
      active: true,
      tier: 'Full Day Scholar',
      dietaryTags: ['Standard Meal'],
    },
    fees: {
      totalTermFee: 28500,
      paidAmount: 8500,
      balance: 20000,
      status: 'Defaulter',
    },
    assessments: {
      eng: { formative: 'AE', summativeScore: 56, level: 'AE', remarks: 'Requires vocabulary expansion and spell-check habits.' },
      kis: { formative: 'ME', summativeScore: 66, level: 'ME', remarks: 'Kusoma kwa kasi nzuri lakini anahitaji kuongeza umakini.' },
      mat: { formative: 'BE', summativeScore: 46, level: 'BE', remarks: 'Recommended for Wednesday evening remedial numeracy clinic.' },
      sci: { formative: 'AE', summativeScore: 55, level: 'AE', remarks: 'Needs revision in periodic classifications and heat transfer.' },
      agr: { formative: 'ME', summativeScore: 68, level: 'ME', remarks: 'Handy in farm tool maintenance and weeding routines.' },
      pre_tech: { formative: 'ME', summativeScore: 67, level: 'ME', remarks: 'Good practical knack for sheet metal bending.' },
      soc: { formative: 'AE', summativeScore: 58, level: 'AE', remarks: 'Needs further reading on pre-colonial trade routes.' },
      cre_ire: { formative: 'ME', summativeScore: 65, level: 'ME', remarks: 'Good social interaction with fellow learners.' },
      arts_sports: { formative: 'EE', summativeScore: 84, level: 'EE', remarks: 'Superb rugby wing player with quick acceleration.' },
    },
    competencies: {
      communication: 3,
      criticalThinking: 2,
      digitalLiteracy: 3,
      citizenship: 3,
      creativity: 3,
      selfEfficacy: 3,
    },
    valuesNotes: 'Well behaved; needs encouragement to develop consistent reading discipline.',
    coCurricular: 'Rugby Club, Woodwork Guild',
    attendancePercent: 89,
  },
];

const INITIAL_MEAL_LOGS: MealLog[] = [
  {
    id: 'ml_01',
    studentId: 'std_01',
    studentName: 'Brian Omondi Odhiambo',
    nemisUpi: 'NEMIS-7849201',
    grade: 'Grade 8',
    stream: '8 Tsavo',
    session: 'Midday Lunch',
    timestamp: '12:44 PM',
    dishServed: 'Nutritious Githeri + Sautéed Sukuma Wiki + Ripe Banana',
    dietaryTags: ['Standard Meal', 'No Peanuts'],
    flaggedAllergy: 'Peanut-Free Verified',
    serverStaff: 'Chef Mary Njeri',
  },
  {
    id: 'ml_02',
    studentId: 'std_02',
    studentName: 'Wanjiku Faith Mwangi',
    nemisUpi: 'NEMIS-9104823',
    grade: 'Grade 8',
    stream: '8 Tsavo',
    session: 'Midday Lunch',
    timestamp: '12:48 PM',
    dishServed: 'Steamed Brown Rice + Yellow Ndengu (Green Grams) Stew',
    dietaryTags: ['Vegetarian Option', 'Lactose Intolerant'],
    flaggedAllergy: 'Dairy-Free Verified',
    serverStaff: 'Chef Mary Njeri',
  },
  {
    id: 'ml_03',
    studentId: 'std_04',
    studentName: 'Amina Hassan Noor',
    nemisUpi: 'NEMIS-8201955',
    grade: 'Grade 9',
    stream: '9 Turkana',
    session: 'Midday Lunch',
    timestamp: '12:51 PM',
    dishServed: 'Halal Beef Stew + Soft Chapati + Cabbage Slaw',
    dietaryTags: ['Halal Only'],
    flaggedAllergy: 'Halal Certified Batch',
    serverStaff: 'Chef Juma Bakari',
  },
  {
    id: 'ml_04',
    studentId: 'std_05',
    studentName: 'Emmanuel Kiprop Korir',
    nemisUpi: 'NEMIS-5192804',
    grade: 'Grade 9',
    stream: '9 Turkana',
    session: 'Midday Lunch',
    timestamp: '12:55 PM',
    dishServed: 'White Ugali + Beef & Spinach Fry',
    dietaryTags: ['Standard Meal'],
    serverStaff: 'Chef Juma Bakari',
  },
];

const INITIAL_TRANSACTIONS: FeeTransaction[] = [
  {
    id: 'tx_01',
    mpesaCode: 'SHG89X02KL',
    studentId: 'std_01',
    studentName: 'Brian Omondi Odhiambo',
    nemisUpi: 'NEMIS-7849201',
    amount: 15000,
    channel: 'M-PESA Paybill',
    payerPhone: '+254 722 890 144',
    payerName: 'Grace Auma',
    date: '2026-10-18 10:14 AM',
    receiptNumber: 'ZWD/RCP/2026/0942',
  },
  {
    id: 'tx_02',
    mpesaCode: 'RKT45P91MN',
    studentId: 'std_02',
    studentName: 'Wanjiku Faith Mwangi',
    nemisUpi: 'NEMIS-9104823',
    amount: 20000,
    channel: 'M-PESA Paybill',
    payerPhone: '+254 710 432 990',
    payerName: 'Peter Mwangi Kamau',
    date: '2026-10-19 02:40 PM',
    receiptNumber: 'ZWD/RCP/2026/0948',
  },
  {
    id: 'tx_03',
    mpesaCode: 'QAZ77M44TY',
    studentId: 'std_04',
    studentName: 'Amina Hassan Noor',
    nemisUpi: 'NEMIS-8201955',
    amount: 36000,
    channel: 'Direct Bank Deposit',
    payerPhone: '+254 799 402 119',
    payerName: 'Hassan Noor Abdi',
    date: '2026-10-14 08:30 AM',
    receiptNumber: 'ZWD/RCP/2026/0911',
  },
  {
    id: 'tx_04',
    mpesaCode: 'PLM12B98WS',
    studentId: 'std_05',
    studentName: 'Emmanuel Kiprop Korir',
    nemisUpi: 'NEMIS-5192804',
    amount: 28500,
    channel: 'M-PESA Paybill',
    payerPhone: '+254 728 554 210',
    payerName: 'Lucy Jepkosgei',
    date: '2026-10-15 11:05 AM',
    receiptNumber: 'ZWD/RCP/2026/0925',
  },
];

const INITIAL_TEACHERS: TeacherTPAD[] = [
  {
    id: 'tch_01',
    tscNumber: 'TSC/412891',
    name: 'Mdm. Grace Ndung’u',
    role: 'Senior Teacher & HOD Languages',
    subjects: ['English'],
    grades: ['Grade 7', 'Grade 8'],
    tpadScore: 4.8,
    syllabusCoverage: 88,
    lessonPlansUploaded: 42,
    lessonPlansTarget: 45,
    remedialSessionsCount: 14,
    cbRubricFidelity: 96,
    standards: {
      professionalKnowledge: 4.9,
      learnerAssessment: 4.8,
      professionalGrowth: 4.7,
      remedialAndInclusion: 4.8,
      safetyAndEthics: 5.0,
    },
    observationNotes: 'Exemplary lesson staging; weaves digital storytelling and oral presentations effectively.',
    status: 'Completed',
  },
  {
    id: 'tch_02',
    tscNumber: 'TSC/502144',
    name: 'Mr. Boniface Kipchumba',
    role: 'HOD STEM & Mathematics Specialist',
    subjects: ['Mathematics'],
    grades: ['Grade 8', 'Grade 9'],
    tpadScore: 4.6,
    syllabusCoverage: 84,
    lessonPlansUploaded: 38,
    lessonPlansTarget: 45,
    remedialSessionsCount: 18,
    cbRubricFidelity: 92,
    standards: {
      professionalKnowledge: 4.7,
      learnerAssessment: 4.6,
      professionalGrowth: 4.5,
      remedialAndInclusion: 4.9,
      safetyAndEthics: 4.8,
    },
    observationNotes: 'Strong focus on remedial numeracy; effectively uses physical measuring tools and algebraic tiles.',
    status: 'Completed',
  },
  {
    id: 'tch_03',
    tscNumber: 'TSC/471092',
    name: 'Dr. Anne Wanjala',
    role: 'Integrated Science Lead & Lab Master',
    subjects: ['Integrated Science'],
    grades: ['Grade 7', 'Grade 8', 'Grade 9'],
    tpadScore: 4.9,
    syllabusCoverage: 91,
    lessonPlansUploaded: 44,
    lessonPlansTarget: 45,
    remedialSessionsCount: 12,
    cbRubricFidelity: 98,
    standards: {
      professionalKnowledge: 5.0,
      learnerAssessment: 4.9,
      professionalGrowth: 5.0,
      remedialAndInclusion: 4.7,
      safetyAndEthics: 4.9,
    },
    observationNotes: 'Organized excellent science congress project exhibition; maintains spotless lab safety registers.',
    status: 'Completed',
  },
  {
    id: 'tch_04',
    tscNumber: 'TSC/520441',
    name: 'Mr. Dennis Wekesa',
    role: 'Agriculture & Nutrition Coordinator',
    subjects: ['Agriculture & Nutrition'],
    grades: ['Grade 7', 'Grade 8'],
    tpadScore: 4.4,
    syllabusCoverage: 79,
    lessonPlansUploaded: 34,
    lessonPlansTarget: 45,
    remedialSessionsCount: 8,
    cbRubricFidelity: 89,
    standards: {
      professionalKnowledge: 4.5,
      learnerAssessment: 4.3,
      professionalGrowth: 4.2,
      remedialAndInclusion: 4.4,
      safetyAndEthics: 4.6,
    },
    observationNotes: 'Established 4 school kitchen garden demo nursery beds; learners actively tend crops.',
    status: 'In Progress',
  },
  {
    id: 'tch_05',
    tscNumber: 'TSC/493820',
    name: 'Eng. Kennedy Mutua',
    role: 'Pre-Technical Studies Specialist',
    subjects: ['Pre-Technical & Pre-Career Studies'],
    grades: ['Grade 8', 'Grade 9'],
    tpadScore: 4.7,
    syllabusCoverage: 86,
    lessonPlansUploaded: 40,
    lessonPlansTarget: 45,
    remedialSessionsCount: 10,
    cbRubricFidelity: 94,
    standards: {
      professionalKnowledge: 4.8,
      learnerAssessment: 4.7,
      professionalGrowth: 4.6,
      remedialAndInclusion: 4.6,
      safetyAndEthics: 5.0,
    },
    observationNotes: 'Workshop safety rules rigorously enforced; learners produce accurate isometric drawings.',
    status: 'Completed',
  },
];

/* =========================================================================
   MAIN APP COMPONENT
   ========================================================================= */

export default function App() {
  // Navigation tabs
  type ActiveTab =
    | 'dashboard'
    | 'cbc'
    | 'tap-to-eat'
    | 'kitchen-inventory'
    | 'textbooks-stationery'
    | 'fees'
    | 'report-card'
    | 'tpad';
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Application Data States
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('zawadi_jss_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [mealLogs, setMealLogs] = useState<MealLog[]>(() => {
    const saved = localStorage.getItem('zawadi_jss_meal_logs');
    return saved ? JSON.parse(saved) : INITIAL_MEAL_LOGS;
  });

  const [transactions, setTransactions] = useState<FeeTransaction[]>(() => {
    const saved = localStorage.getItem('zawadi_jss_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [teachers, setTeachers] = useState<TeacherTPAD[]>(() => {
    const saved = localStorage.getItem('zawadi_jss_teachers');
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });

  // Sound toggle
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active student for report card & profiling
  const [selectedStudentId, setSelectedStudentId] = useState<string>('std_01');

  // Tap-to-Eat Simulator state
  const [currentMealSession, setCurrentMealSession] = useState<MealSession>('Midday Lunch');
  const [tapSelectedStudentId, setTapSelectedStudentId] = useState<string>('std_01');
  const [tapStatus, setTapStatus] = useState<{
    type: 'idle' | 'success' | 'duplicate' | 'allergy_warning' | 'ineligible';
    message?: string;
    student?: Student;
    timestamp?: string;
  }>({ type: 'idle' });
  const [isScanning, setIsScanning] = useState(false);

  // Fee payment modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    studentId: 'std_02',
    amount: 8500,
    phone: '254710432990',
    payerName: 'Peter Mwangi Kamau',
    channel: 'M-PESA Paybill' as const,
  });
  const [simulatedMpesaAlert, setSimulatedMpesaAlert] = useState<{
    code: string;
    amount: number;
    phone: string;
    studentName: string;
    balance: number;
    receiptNo: string;
  } | null>(null);

  // CBC Filter states
  const [cbcGradeFilter, setCbcGradeFilter] = useState<'All' | 'Grade 7' | 'Grade 8' | 'Grade 9'>('All');
  const [cbcSubjectFilter, setCbcSubjectFilter] = useState<string>('mat');
  const [editingAssessmentStudent, setEditingAssessmentStudent] = useState<Student | null>(null);

  // TPAD appraisal modal state
  const [evaluatingTeacher, setEvaluatingTeacher] = useState<TeacherTPAD | null>(null);
  const [teacherEvalForm, setTeacherEvalForm] = useState({
    professionalKnowledge: 4.8,
    learnerAssessment: 4.7,
    professionalGrowth: 4.5,
    remedialAndInclusion: 4.6,
    safetyAndEthics: 4.9,
    observationNotes: '',
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('zawadi_jss_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('zawadi_jss_meal_logs', JSON.stringify(mealLogs));
  }, [mealLogs]);

  useEffect(() => {
    localStorage.setItem('zawadi_jss_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('zawadi_jss_teachers', JSON.stringify(teachers));
  }, [teachers]);

  // Selected student object
  const currentStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  // General Metrics
  const summaryMetrics = useMemo(() => {
    const totalStudents = students.length;
    const totalFeesExpected = students.reduce((acc, s) => acc + s.fees.totalTermFee, 0);
    const totalFeesPaid = students.reduce((acc, s) => acc + s.fees.paidAmount, 0);
    const totalFeesBalance = students.reduce((acc, s) => acc + s.fees.balance, 0);
    const feeCollectionRate = Math.round((totalFeesPaid / (totalFeesExpected || 1)) * 100);

    const clearedCount = students.filter((s) => s.fees.status === 'Cleared').length;
    const partialCount = students.filter((s) => s.fees.status === 'Partial').length;
    const defaulterCount = students.filter((s) => s.fees.status === 'Defaulter').length;

    // Today's lunch served
    const todayLunchCount = mealLogs.filter((m) => m.session === 'Midday Lunch').length;
    const mealsServedTotal = mealLogs.length;

    // CBC levels aggregate
    let eeCount = 0;
    let meCount = 0;
    let aeCount = 0;
    let beCount = 0;
    let totalScores = 0;
    let sumScore = 0;

    students.forEach((std) => {
      Object.values(std.assessments).forEach((ass) => {
        totalScores++;
        sumScore += ass.summativeScore;
        if (ass.level === 'EE') eeCount++;
        else if (ass.level === 'ME') meCount++;
        else if (ass.level === 'AE') aeCount++;
        else beCount++;
      });
    });

    const avgSummative = totalScores > 0 ? Math.round(sumScore / totalScores) : 0;
    const cbcMasteryIndex = totalScores > 0 ? Math.round(((eeCount + meCount) / totalScores) * 100) : 0;

    return {
      totalStudents,
      totalFeesExpected,
      totalFeesPaid,
      totalFeesBalance,
      feeCollectionRate,
      clearedCount,
      partialCount,
      defaulterCount,
      todayLunchCount,
      mealsServedTotal,
      eeCount,
      meCount,
      aeCount,
      beCount,
      avgSummative,
      cbcMasteryIndex,
    };
  }, [students, mealLogs]);

  /* =========================================================================
     TAP-TO-EAT SMART CARD SCAN HANDLER
     ========================================================================= */

  const handleSimulateSmartCardTap = (targetStudentId?: string) => {
    const studentToTap = students.find((s) => s.id === (targetStudentId || tapSelectedStudentId));
    if (!studentToTap) return;

    setIsScanning(true);
    setTapStatus({ type: 'idle' });

    setTimeout(() => {
      setIsScanning(false);
      const currentTimeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      // Check if already served this session
      const alreadyServed = mealLogs.some(
        (log) => log.studentId === studentToTap.id && log.session === currentMealSession
      );

      if (alreadyServed) {
        if (soundEnabled) playSound('tap-error');
        setTapStatus({
          type: 'duplicate',
          message: `DUPLICATE TAP: ${studentToTap.name} has ALREADY been served ${currentMealSession} today!`,
          student: studentToTap,
          timestamp: currentTimeStr,
        });
        return;
      }

      // Check meal plan active
      if (!studentToTap.mealPlan.active) {
        if (soundEnabled) playSound('tap-error');
        setTapStatus({
          type: 'ineligible',
          message: `INELIGIBLE: ${studentToTap.name} does not have an active ${studentToTap.mealPlan.tier} meal plan.`,
          student: studentToTap,
          timestamp: currentTimeStr,
        });
        return;
      }

      // Determine dish name based on session
      let dishName = 'Nutritious Githeri + Sautéed Sukuma Wiki + Ripe Banana';
      if (currentMealSession === 'Morning Porridge') dishName = 'Millet & Soya Uji + Boiled Nduma (Arrowroot)';
      else if (currentMealSession === '10 AM Tea Break') dishName = 'Chai ya Maziwa (Kenya Tea) + Mandazi';
      else if (currentMealSession === '4 PM Tea') dishName = 'Fresh Lemon Grass Tea + Sweet Potato Slices';
      else if (currentMealSession === 'Boarder Dinner') dishName = 'Hot Ugali + Sautéed Beef & Cabbage';

      // Check dietary alert
      const hasAllergy = Boolean(studentToTap.mealPlan.allergyWarning);

      // Create meal log
      const newLog: MealLog = {
        id: `ml_${Date.now()}`,
        studentId: studentToTap.id,
        studentName: studentToTap.name,
        nemisUpi: studentToTap.nemisUpi,
        grade: studentToTap.grade,
        stream: studentToTap.stream,
        session: currentMealSession,
        timestamp: currentTimeStr,
        dishServed: dishName,
        dietaryTags: studentToTap.mealPlan.dietaryTags,
        flaggedAllergy: studentToTap.mealPlan.allergyWarning,
        serverStaff: 'Cafeteria Officer Hellen Adhiambo',
      };

      setMealLogs((prev) => [newLog, ...prev]);

      if (hasAllergy) {
        if (soundEnabled) playSound('tap-error');
        setTapStatus({
          type: 'allergy_warning',
          message: `SPECIAL DIET DISPENSED: ${studentToTap.name} (${studentToTap.mealPlan.allergyWarning})`,
          student: studentToTap,
          timestamp: currentTimeStr,
        });
      } else {
        if (soundEnabled) playSound('tap-success');
        setTapStatus({
          type: 'success',
          message: `MEAL AUTHORIZED: ${studentToTap.name} checked in for ${currentMealSession}.`,
          student: studentToTap,
          timestamp: currentTimeStr,
        });
      }
    }, 600);
  };

  /* =========================================================================
     M-PESA PAYMENT SIMULATOR
     ========================================================================= */

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === paymentForm.studentId);
    if (!student) return;

    // Generate authentic Kenyan Safaricom M-Pesa transaction code (10 alphanumeric e.g. 'SHG89X02KL')
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const numbers = '0123456789';
    let generatedCode = '';
    for (let i = 0; i < 4; i++) generatedCode += letters.charAt(Math.floor(Math.random() * letters.length));
    for (let i = 0; i < 2; i++) generatedCode += numbers.charAt(Math.floor(Math.random() * numbers.length));
    for (let i = 0; i < 4; i++) generatedCode += letters.charAt(Math.floor(Math.random() * letters.length));

    const receiptNum = `ZWD/RCP/2026/${Math.floor(1000 + Math.random() * 9000)}`;
    const payAmount = Number(paymentForm.amount);
    const newPaid = student.fees.paidAmount + payAmount;
    const newBalance = Math.max(0, student.fees.totalTermFee - newPaid);
    const newStatus: 'Cleared' | 'Partial' | 'Defaulter' =
      newBalance === 0 ? 'Cleared' : newBalance > student.fees.totalTermFee * 0.4 ? 'Defaulter' : 'Partial';

    // Update student fees
    setStudents((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, fees: { ...s.fees, paidAmount: newPaid, balance: newBalance, status: newStatus } } : s))
    );

    // Add transaction
    const newTx: FeeTransaction = {
      id: `tx_${Date.now()}`,
      mpesaCode: generatedCode,
      studentId: student.id,
      studentName: student.name,
      nemisUpi: student.nemisUpi,
      amount: payAmount,
      channel: paymentForm.channel,
      payerPhone: paymentForm.phone.startsWith('+') ? paymentForm.phone : `+${paymentForm.phone}`,
      payerName: paymentForm.payerName,
      date: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      receiptNumber: receiptNum,
    };

    setTransactions((prev) => [newTx, ...prev]);

    if (soundEnabled) playSound('mpesa-success');

    // Show M-Pesa SMS simulation modal
    setSimulatedMpesaAlert({
      code: generatedCode,
      amount: payAmount,
      phone: newTx.payerPhone,
      studentName: student.name,
      balance: newBalance,
      receiptNo: receiptNum,
    });

    setIsPaymentModalOpen(false);
  };

  /* =========================================================================
     CBC ASSESSMENT MARK UPDATER
     ========================================================================= */

  const handleUpdateStudentAssessment = (studentId: string, subjectId: string, score: number, remarks?: string) => {
    const level = scoreToCBCLevel(score);
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const currentAss = s.assessments[subjectId] || { formative: 'ME', summativeScore: score, level, remarks: '' };
        return {
          ...s,
          assessments: {
            ...s.assessments,
            [subjectId]: {
              ...currentAss,
              summativeScore: score,
              level,
              formative: level,
              remarks: remarks !== undefined ? remarks : currentAss.remarks,
            },
          },
        };
      })
    );
  };

  /* =========================================================================
     TPAD APPRAISAL SUBMIT
     ========================================================================= */

  const handleSaveTeacherAppraisal = () => {
    if (!evaluatingTeacher) return;
    const stds = teacherEvalForm;
    const avgScore = Number(
      (
        (stds.professionalKnowledge +
          stds.learnerAssessment +
          stds.professionalGrowth +
          stds.remedialAndInclusion +
          stds.safetyAndEthics) /
        5
      ).toFixed(2)
    );

    setTeachers((prev) =>
      prev.map((t) =>
        t.id === evaluatingTeacher.id
          ? {
              ...t,
              tpadScore: avgScore,
              standards: stds,
              observationNotes: stds.observationNotes || t.observationNotes,
              status: 'Completed',
            }
          : t
      )
    );

    if (soundEnabled) playSound('tap-success');
    setEvaluatingTeacher(null);
  };

  /* Filtered students for CBC Tracking view */
  const filteredCbcStudents = useMemo(() => {
    return students.filter((s) => {
      if (cbcGradeFilter !== 'All' && s.grade !== cbcGradeFilter) return false;
      return true;
    });
  }, [students, cbcGradeFilter]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* =========================================================================
          TOP INSTITUTIONAL BAR & ACCORDING NAVIGATION (Top Bar Contract)
          ========================================================================= */}
      <header className="no-print sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-8 h-16">
            {/* Zone 1: Single-element Brand Wordmark */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
                <School className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
                  Zawadi Junior Secondary School
                </span>
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  MoE Center: 20401823 · NEMIS & CBC CBA Integrated
                </span>
              </div>
            </div>

            {/* Zone 2: Clean Nav Links */}
            <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 text-sm font-medium">
              {[
                { id: 'dashboard', label: 'Overview' },
                { id: 'cbc', label: 'CBC Curriculum' },
                { id: 'tap-to-Eat', label: 'Tap-to-Eat', tabKey: 'tap-to-eat' },
                { id: 'kitchen-inventory', label: 'Kitchen Stores' },
                { id: 'textbooks-stationery', label: 'Books & Stationery' },
                { id: 'fees', label: 'M-Pesa Fees' },
                { id: 'report-card', label: 'Reports' },
                { id: 'tpad', label: 'Teacher TPAD' },
              ].map((item) => {
                const targetKey = (item.tabKey || item.id) as ActiveTab;
                const isActive = activeTab === targetKey;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(targetKey);
                      if (soundEnabled) playSound('click');
                    }}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: 1 Primary Action + Quick Utility Toggles */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'NFC Beep Audio Enabled' : 'NFC Beep Muted'}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-700" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  setActiveTab('tap-to-eat');
                  if (soundEnabled) playSound('click');
                }}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <ScanLine className="w-3.5 h-3.5" />
                Tap-to-Eat Terminal
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex overflow-x-auto gap-1 px-4 py-2 bg-slate-50 border-t border-slate-200">
          {[
            { id: 'dashboard', label: 'Overview' },
            { id: 'cbc', label: 'CBC Tracking' },
            { id: 'tap-to-eat', label: 'Tap-to-Eat' },
            { id: 'kitchen-inventory', label: 'Kitchen Stores' },
            { id: 'textbooks-stationery', label: 'Books & Stationery' },
            { id: 'fees', label: 'Fees & M-Pesa' },
            { id: 'report-card', label: 'Reports' },
            { id: 'tpad', label: 'TPAD KPIs' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as ActiveTab);
                if (soundEnabled) playSound('click');
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
                activeTab === item.id ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {/* Institutional Term Kicker Strip */}
      <div className="no-print bg-slate-900 text-slate-300 py-1.5 px-4 text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-emerald-400">MoE Academic Year 2026</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Term 1 (Week 7 of 13)</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="hidden sm:inline">Nairobi Westlands Cluster</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Enrolled JSS: <strong className="text-white tabular-nums">{students.length} Learners</strong></span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="hidden sm:inline">Today&apos;s Lunch Served: <strong className="text-white tabular-nums">{summaryMetrics.todayLunchCount}</strong></span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MAIN WORKSPACE CONTENT VIEWPORT
          ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* =======================================================================
            VIEW 1: OVERVIEW DASHBOARD & STATISTICAL METRICS
            ======================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top Metric Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2 text-xs font-medium">
                  <span>Total JSS Enrollment</span>
                  <Users className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="text-2xl font-bold text-slate-900 tabular-nums">
                  {summaryMetrics.totalStudents} Learners
                </div>
                <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                  <span className="text-emerald-700 font-semibold">Grades 7, 8 & 9</span>
                  <span>· 5 Active Streams</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2 text-xs font-medium">
                  <span>Term 1 Fee Collections</span>
                  <CreditCard className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="text-2xl font-bold text-slate-900 tabular-nums">
                  KES {summaryMetrics.totalFeesPaid.toLocaleString()}
                </div>
                <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                  <span>Efficiency: <strong className="text-emerald-700 tabular-nums">{summaryMetrics.feeCollectionRate}%</strong></span>
                  <span className="text-rose-600 tabular-nums">Bal: KES {summaryMetrics.totalFeesBalance.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2 text-xs font-medium">
                  <span>Tap-to-Eat Cafeteria Log</span>
                  <Utensils className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="text-2xl font-bold text-slate-900 tabular-nums">
                  {summaryMetrics.todayLunchCount} Served
                </div>
                <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                  <span className="text-sky-700 font-semibold">{Math.round((summaryMetrics.todayLunchCount / summaryMetrics.totalStudents) * 100)}% Uptake</span>
                  <span>· Smart Card Checked</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2 text-xs font-medium">
                  <span>CBC Curriculum Mastery</span>
                  <Award className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="text-2xl font-bold text-slate-900 tabular-nums">
                  {summaryMetrics.cbcMasteryIndex}% Proficient
                </div>
                <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                  <span className="text-emerald-700 font-semibold tabular-nums">{summaryMetrics.eeCount} EE</span>
                  <span>·</span>
                  <span className="text-sky-700 font-semibold tabular-nums">{summaryMetrics.meCount} ME</span>
                  <span>·</span>
                  <span className="text-amber-700 font-semibold tabular-nums">{summaryMetrics.aeCount} AE</span>
                </div>
              </div>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: CBC Grade Distribution & Learning Area Breakdown */}
              <div className="lg:col-span-2 space-y-6">
                {/* CBC Performance Levels Chart */}
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                    <div>
                      <h2 className="text-base font-semibold text-slate-900">
                        MoE CBC Performance Rubric Distribution
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Formative and summative levels across JSS Core Learning Areas
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> EE
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span> ME
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span> AE
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> BE
                      </span>
                    </div>
                  </div>

                  {/* Visual Bar Breakdown */}
                  <div className="mt-6 space-y-4">
                    {JSS_LEARNING_AREAS.slice(0, 6).map((subject) => {
                      // Calculate counts for this subject
                      let sEE = 0, sME = 0, sAE = 0, sBE = 0;
                      students.forEach((s) => {
                        const level = s.assessments[subject.id]?.level || 'ME';
                        if (level === 'EE') sEE++;
                        else if (level === 'ME') sME++;
                        else if (level === 'AE') sAE++;
                        else sBE++;
                      });
                      const total = students.length || 1;
                      const pEE = Math.round((sEE / total) * 100);
                      const pME = Math.round((sME / total) * 100);
                      const pAE = Math.round((sAE / total) * 100);
                      const pBE = 100 - (pEE + pME + pAE);

                      return (
                        <div key={subject.id}>
                          <div className="flex justify-between text-xs font-medium mb-1.5">
                            <span className="text-slate-800">{subject.name}</span>
                            <span className="text-slate-500 tabular-nums">
                              {sEE + sME}/{total} Proficient ({pEE + pME}%)
                            </span>
                          </div>
                          <div className="w-full h-3 bg-slate-100 rounded-full flex overflow-hidden">
                            <div style={{ width: `${pEE}%` }} className="bg-emerald-600 h-full" title={`EE: ${sEE}`} />
                            <div style={{ width: `${pME}%` }} className="bg-sky-600 h-full" title={`ME: ${sME}`} />
                            <div style={{ width: `${pAE}%` }} className="bg-amber-500 h-full" title={`AE: ${sAE}`} />
                            <div style={{ width: `${Math.max(0, pBE)}%` }} className="bg-rose-500 h-full" title={`BE: ${sBE}`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Target: Min 80% Meeting or Exceeding (KNEC Standard)</span>
                    <button
                      onClick={() => setActiveTab('cbc')}
                      className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                    >
                      Open Full Curriculum Matrix <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quick Student Registry Summary */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
                  <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Enrolled JSS Learners</h3>
                      <p className="text-xs text-slate-500">NEMIS Unique Personal Identifier (UPI) Registered</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('report-card')}
                      className="text-xs text-emerald-700 font-semibold hover:underline"
                    >
                      Generate Reports
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                        <tr>
                          <th className="px-4 py-3">Learner Name</th>
                          <th className="px-4 py-3">NEMIS UPI</th>
                          <th className="px-4 py-3">Grade & Stream</th>
                          <th className="px-4 py-3">Meal Plan</th>
                          <th className="px-4 py-3">Fee Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {students.slice(0, 5).map((student) => (
                          <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-900">
                              {student.name}
                            </td>
                            <td className="px-4 py-3 text-slate-600 font-mono">
                              {student.nemisUpi}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {student.stream}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-slate-700">
                                {student.mealPlan.tier}
                              </span>
                              {student.mealPlan.allergyWarning && (
                                <span className="block text-[10px] text-amber-700 font-medium">
                                  {student.mealPlan.allergyWarning}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                                  student.fees.status === 'Cleared'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : student.fees.status === 'Partial'
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-rose-50 text-rose-700'
                                }`}
                              >
                                {student.fees.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedStudentId(student.id);
                                  setActiveTab('report-card');
                                }}
                                className="text-emerald-700 hover:text-emerald-900 font-medium"
                              >
                                View Report
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Col: Tap-to-Eat Quick Station & Recent M-Pesa Transactions */}
              <div className="space-y-6">
                {/* Tap-to-Eat Quick Reader Widget */}
                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-emerald-700" />
                      <h3 className="text-sm font-semibold text-slate-900">Tap-to-Eat Terminal</h3>
                    </div>
                    <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                      Active: {currentMealSession}
                    </span>
                  </div>

                  <div className="mt-4 p-4 bg-slate-900 text-white rounded-lg text-center relative overflow-hidden">
                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                      Virtual Smart Card Scanner
                    </div>
                    <div className="text-lg font-bold text-white mb-3">
                      Ready for Student Tap
                    </div>

                    <div className="flex justify-center my-3">
                      <button
                        onClick={() => handleSimulateSmartCardTap()}
                        disabled={isScanning}
                        className={`w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all ${
                          isScanning
                            ? 'border-emerald-400 bg-emerald-950 scale-105 animate-pulse'
                            : 'border-slate-700 bg-slate-800 hover:border-emerald-500 hover:bg-slate-700 cursor-pointer'
                        }`}
                      >
                        <ScanLine className={`w-8 h-8 ${isScanning ? 'text-emerald-400 animate-spin' : 'text-slate-300'}`} />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Tap card or simulate learner NFC badge
                    </p>

                    <div className="mt-3 pt-3 border-t border-slate-800 text-left">
                      <label className="text-[10px] text-slate-400 block mb-1">Select Learner in Line:</label>
                      <select
                        value={tapSelectedStudentId}
                        onChange={(e) => setTapSelectedStudentId(e.target.value)}
                        className="w-full bg-slate-800 text-white text-xs border border-slate-700 rounded p-1.5 focus:outline-none focus:border-emerald-500"
                      >
                        {students.map((std) => (
                          <option key={std.id} value={std.id}>
                            {std.name} ({std.stream}) - {std.mealPlan.allergyWarning || 'No Allergy'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Tap Status Banner */}
                  {tapStatus.type !== 'idle' && (
                    <div
                      className={`mt-3 p-3 rounded text-xs border ${
                        tapStatus.type === 'success'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : tapStatus.type === 'allergy_warning'
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-rose-50 border-rose-200 text-rose-800'
                      }`}
                    >
                      <div className="font-semibold flex items-center gap-1.5">
                        {tapStatus.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        {tapStatus.type === 'allergy_warning' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                        {(tapStatus.type === 'duplicate' || tapStatus.type === 'ineligible') && (
                          <ShieldAlert className="w-4 h-4 text-rose-600" />
                        )}
                        <span>{tapStatus.message}</span>
                      </div>
                      {tapStatus.timestamp && (
                        <div className="mt-1 text-[10px] opacity-75">
                          Logged at: {tapStatus.timestamp} · Server: Hellen Adhiambo
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Today: <strong className="text-slate-800 tabular-nums">{summaryMetrics.todayLunchCount} meals</strong></span>
                    <button
                      onClick={() => setActiveTab('tap-to-eat')}
                      className="text-emerald-700 font-semibold hover:underline"
                    >
                      Open Full Cafeteria View →
                    </button>
                  </div>
                </div>

                {/* Recent M-Pesa Collections */}
                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-700" />
                      <h3 className="text-sm font-semibold text-slate-900">Recent M-Pesa Receipts</h3>
                    </div>
                    <button
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded font-medium flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Record Fee
                    </button>
                  </div>

                  <div className="mt-3 divide-y divide-slate-100">
                    {transactions.slice(0, 4).map((tx) => (
                      <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-slate-800">{tx.studentName}</div>
                          <div className="text-slate-500 font-mono text-[11px]">
                            {tx.mpesaCode} · {tx.payerPhone}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-700 tabular-nums">
                            KES {tx.amount.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400">{tx.date.split(' ')[0]}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 text-center">
                    <button
                      onClick={() => setActiveTab('fees')}
                      className="text-xs text-emerald-700 font-semibold hover:underline"
                    >
                      View All Fee Records & Ledger →
                    </button>
                  </div>
                </div>

                {/* Kitchen Stores & Textbook Quick Widget */}
                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Warehouse className="w-4 h-4 text-emerald-700" />
                      <h3 className="text-sm font-semibold text-slate-900">Stores & MoE Textbooks</h3>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                      Excel Ready
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-100">
                      <div>
                        <div className="font-semibold text-slate-800">Kitchen Foodstocks</div>
                        <div className="text-[11px] text-slate-500">Dry maize, beans, rice & manual logs</div>
                      </div>
                      <button
                        onClick={() => setActiveTab('kitchen-inventory')}
                        className="text-xs text-emerald-700 font-semibold hover:underline"
                      >
                        Manage →
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-100">
                      <div>
                        <div className="font-semibold text-slate-800">Textbooks & Stationery</div>
                        <div className="text-[11px] text-slate-500">MoE CBC book loans & exercise books</div>
                      </div>
                      <button
                        onClick={() => setActiveTab('textbooks-stationery')}
                        className="text-xs text-emerald-700 font-semibold hover:underline"
                      >
                        Issue →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =======================================================================
            VIEW 2: MOE CBC CURRICULUM TRACKING (GRADES 7, 8, 9)
            ======================================================================= */}
        {activeTab === 'cbc' && (
          <div className="space-y-6">
            {/* Header & Filter Controls */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    MoE CBC Curriculum Assessment Tracker
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Formative projects, continuous assessment tests (CAT), and summative performance levels for Grades 7, 8 & 9.
                  </p>
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md text-xs">
                    {(['All', 'Grade 7', 'Grade 8', 'Grade 9'] as const).map((grade) => (
                      <button
                        key={grade}
                        onClick={() => setCbcGradeFilter(grade)}
                        className={`px-3 py-1.5 rounded font-medium transition-colors ${
                          cbcGradeFilter === grade ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {grade}
                      </button>
                    ))}
                  </div>

                  <select
                    value={cbcSubjectFilter}
                    onChange={(e) => setCbcSubjectFilter(e.target.value)}
                    className="text-xs bg-white border border-slate-300 rounded-md px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {JSS_LEARNING_AREAS.map((subj) => (
                      <option key={subj.id} value={subj.id}>
                        {subj.name} ({subj.code})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      const currentSubj = JSS_LEARNING_AREAS.find((s) => s.id === cbcSubjectFilter);
                      exportToExcel(
                        `Zawadi_JSS_${currentSubj?.code || 'CBC'}_Marks`,
                        filteredCbcStudents,
                        [
                          { header: 'Learner Name', key: 'name' },
                          { header: 'NEMIS UPI', key: 'nemisUpi' },
                          { header: 'KNEC Assessment No', key: 'assessmentNo' },
                          { header: 'Grade', key: 'grade' },
                          { header: 'Stream', key: 'stream' },
                          { header: 'Gender', key: 'gender' },
                          { header: 'Learning Area', key: () => currentSubj?.name || 'Subject' },
                          {
                            header: 'Formative Level',
                            key: (std) => std.assessments[cbcSubjectFilter]?.formative || 'ME',
                          },
                          {
                            header: 'Summative Score (%)',
                            key: (std) => std.assessments[cbcSubjectFilter]?.summativeScore || 70,
                          },
                          {
                            header: 'Performance Level',
                            key: (std) => std.assessments[cbcSubjectFilter]?.level || 'ME',
                          },
                          {
                            header: 'Teacher Rubric Notes',
                            key: (std) => std.assessments[cbcSubjectFilter]?.remarks || '',
                          },
                        ]
                      );
                    }}
                    className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Export to Excel (.csv)
                  </button>
                </div>
              </div>

              {/* Subject details card */}
              {(() => {
                const currentSubj = JSS_LEARNING_AREAS.find((s) => s.id === cbcSubjectFilter);
                if (!currentSubj) return null;
                return (
                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block">Lead Educator:</span>
                      <strong className="text-slate-800">{currentSubj.leadTeacher}</strong>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-slate-400 block">Assessed Curriculum Strands (Term 1):</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {currentSubj.strands.map((strand, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                            {strand}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Assessment Entry & Rubric Matrix */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  Showing {filteredCbcStudents.length} Learners ({cbcGradeFilter})
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-700 font-semibold">EE = Exceeding (80-100%)</span>
                  <span className="text-sky-700 font-semibold">ME = Meeting (65-79%)</span>
                  <span className="text-amber-700 font-semibold">AE = Approaching (50-64%)</span>
                  <span className="text-rose-700 font-semibold">BE = Below (&lt;50%)</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">Learner & NEMIS</th>
                      <th className="px-4 py-3">Grade & Stream</th>
                      <th className="px-4 py-3 text-center">Formative Level</th>
                      <th className="px-4 py-3 text-center">Summative Mark</th>
                      <th className="px-4 py-3 text-center">Performance Level</th>
                      <th className="px-4 py-3">Teacher Competency Notes</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCbcStudents.map((std) => {
                      const assessment = std.assessments[cbcSubjectFilter] || {
                        formative: 'ME',
                        summativeScore: 70,
                        level: 'ME',
                        remarks: 'Good participation',
                      };
                      const rubricMeta = getCBCLevelDescription(assessment.level);

                      return (
                        <tr key={std.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900">{std.name}</div>
                            <div className="text-slate-500 font-mono text-[11px]">{std.nemisUpi}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-700 font-medium">{std.stream}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="inline-flex gap-1 bg-slate-100 p-0.5 rounded">
                              {(['EE', 'ME', 'AE', 'BE'] as const).map((lvl) => (
                                <button
                                  key={lvl}
                                  onClick={() => {
                                    const newScore = lvl === 'EE' ? 85 : lvl === 'ME' ? 72 : lvl === 'AE' ? 58 : 45;
                                    handleUpdateStudentAssessment(std.id, cbcSubjectFilter, newScore);
                                    if (soundEnabled) playSound('click');
                                  }}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                    assessment.formative === lvl
                                      ? lvl === 'EE'
                                        ? 'bg-emerald-600 text-white'
                                        : lvl === 'ME'
                                        ? 'bg-sky-600 text-white'
                                        : lvl === 'AE'
                                        ? 'bg-amber-600 text-white'
                                        : 'bg-rose-600 text-white'
                                      : 'text-slate-500 hover:text-slate-900'
                                  }`}
                                >
                                  {lvl}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={assessment.summativeScore}
                                onChange={(e) => {
                                  const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                                  handleUpdateStudentAssessment(std.id, cbcSubjectFilter, val);
                                }}
                                className="w-16 px-2 py-1 text-center font-bold tabular-nums border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                              <span className="text-slate-400 font-medium">%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded text-xs font-bold border ${rubricMeta.bg}`}
                            >
                              {assessment.level} · {assessment.level === 'EE' ? 'Exceeding' : assessment.level === 'ME' ? 'Meeting' : assessment.level === 'AE' ? 'Approaching' : 'Below'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={assessment.remarks}>
                            {assessment.remarks || 'Standard progress maintained.'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setEditingAssessmentStudent(std)}
                              className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
                            >
                              Edit Notes
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Remarks Editing Modal */}
            {editingAssessmentStudent && (
              <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-slate-200">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {editingAssessmentStudent.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {JSS_LEARNING_AREAS.find((s) => s.id === cbcSubjectFilter)?.name} Rubric Notes
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingAssessmentStudent(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Formative Score (%):
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editingAssessmentStudent.assessments[cbcSubjectFilter]?.summativeScore || 70}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          handleUpdateStudentAssessment(editingAssessmentStudent.id, cbcSubjectFilter, val);
                        }}
                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Teacher Feedback / Remedial Plan:
                      </label>
                      <textarea
                        rows={4}
                        defaultValue={editingAssessmentStudent.assessments[cbcSubjectFilter]?.remarks || ''}
                        id="remarks_textarea"
                        className="w-full border border-slate-300 rounded p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="Enter qualitative notes on learner competency, project fidelity, and areas for improvement..."
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex justify-end gap-2">
                    <button
                      onClick={() => setEditingAssessmentStudent(null)}
                      className="px-4 py-2 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        const area = document.getElementById('remarks_textarea') as HTMLTextAreaElement;
                        const score = editingAssessmentStudent.assessments[cbcSubjectFilter]?.summativeScore || 70;
                        handleUpdateStudentAssessment(editingAssessmentStudent.id, cbcSubjectFilter, score, area?.value);
                        setEditingAssessmentStudent(null);
                        if (soundEnabled) playSound('click');
                      }}
                      className="px-4 py-2 bg-emerald-700 text-white rounded text-xs font-semibold hover:bg-emerald-800"
                    >
                      Save Assessment
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =======================================================================
            VIEW 3: "TAP-TO-EAT" MEAL TRACKING SUB-SYSTEM
            ======================================================================= */}
        {activeTab === 'tap-to-eat' && (
          <div className="space-y-6">
            {/* Session Selector & Meal Metrics Header */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-emerald-700" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Tap-to-Eat Cafeteria & Nutrition Management
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Smart card NFC contactless meal verification with dietary safety and allergy warning alerts.
                </p>
              </div>

              {/* Meal Session Toggle Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md overflow-x-auto">
                {(['Morning Porridge', '10 AM Tea Break', 'Midday Lunch', '4 PM Tea', 'Boarder Dinner'] as MealSession[]).map(
                  (sess) => (
                    <button
                      key={sess}
                      onClick={() => {
                        setCurrentMealSession(sess);
                        setTapStatus({ type: 'idle' });
                        if (soundEnabled) playSound('click');
                      }}
                      className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-colors ${
                        currentMealSession === sess
                          ? 'bg-emerald-800 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                    >
                      {sess}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Cafeteria Hardware Scanner & Live Rack */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Interactive NFC Reader Station */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-slate-900 text-white rounded-lg p-6 border border-slate-800 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                      <span className="text-xs font-mono tracking-wide text-slate-300">
                        NFC TERMINAL #01 · ACTIVE
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">Server: Hellen Adhiambo</span>
                  </div>

                  <div className="my-6 text-center">
                    <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-1">
                      Serving Session: {currentMealSession}
                    </div>
                    <h3 className="text-xl font-bold text-white">Tap Learner Smart Card</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Hold NFC badge near the scanner contact circle
                    </p>

                    {/* Interactive Scan Target Button */}
                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={() => handleSimulateSmartCardTap()}
                        disabled={isScanning}
                        className={`w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center transition-all ${
                          isScanning
                            ? 'border-emerald-400 bg-emerald-950/80 scale-105 shadow-lg shadow-emerald-500/20'
                            : 'border-slate-700 bg-slate-800 hover:border-emerald-500 hover:scale-102 cursor-pointer shadow-md'
                        }`}
                      >
                        <ScanLine
                          className={`w-12 h-12 mb-2 ${
                            isScanning ? 'text-emerald-400 animate-pulse' : 'text-slate-300'
                          }`}
                        />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                          {isScanning ? 'Verifying...' : 'TAP CARD'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Manual / Quick Picker dropdown */}
                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">
                        Select Learner in Cafeteria Queue:
                      </label>
                      <select
                        value={tapSelectedStudentId}
                        onChange={(e) => {
                          setTapSelectedStudentId(e.target.value);
                          setTapStatus({ type: 'idle' });
                        }}
                        className="w-full bg-slate-800 text-white text-xs border border-slate-700 rounded p-2 focus:outline-none focus:border-emerald-500 font-medium"
                      >
                        {students.map((std) => (
                          <option key={std.id} value={std.id}>
                            {std.name} · {std.stream} ({std.mealPlan.allergyWarning || 'No Allergies'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => handleSimulateSmartCardTap()}
                      className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded transition-colors"
                    >
                      Process Tap for Selected Learner
                    </button>
                  </div>
                </div>

                {/* Live Tap Verification Feedback Panel */}
                {tapStatus.type !== 'idle' && tapStatus.student && (
                  <div
                    className={`p-4 rounded-lg border shadow-xs transition-all ${
                      tapStatus.type === 'success'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : tapStatus.type === 'allergy_warning'
                        ? 'bg-amber-50 border-amber-300 text-amber-950'
                        : 'bg-rose-50 border-rose-300 text-rose-950'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {tapStatus.type === 'success' && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                        )}
                        {tapStatus.type === 'allergy_warning' && (
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                        )}
                        {(tapStatus.type === 'duplicate' || tapStatus.type === 'ineligible') && (
                          <ShieldAlert className="w-5 h-5 text-rose-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold">{tapStatus.message}</div>
                        <div className="mt-1 text-xs text-slate-700">
                          Learner: <strong>{tapStatus.student.name}</strong> ({tapStatus.student.stream}) · NEMIS: <span className="font-mono">{tapStatus.student.nemisUpi}</span>
                        </div>

                        {tapStatus.student.mealPlan.allergyWarning && (
                          <div className="mt-2 p-2 bg-amber-100/90 text-amber-900 rounded font-semibold text-xs border border-amber-200">
                            CRITICAL KITCHEN WARNING: {tapStatus.student.mealPlan.allergyWarning}
                          </div>
                        )}

                        <div className="mt-2 text-[11px] text-slate-500">
                          Smart Card UID: <code className="font-mono">{tapStatus.student.smartCardUid}</code> · Session: {currentMealSession}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Real-time Meal Transaction Log & Session Metrics */}
              <div className="lg:col-span-7 space-y-4">
                {/* Session Stat Strip */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
                    <span className="text-[11px] text-slate-500 block">Session Uptake</span>
                    <span className="text-xl font-bold text-slate-900 tabular-nums">
                      {mealLogs.filter((m) => m.session === currentMealSession).length}
                    </span>
                    <span className="text-[10px] text-emerald-700 block mt-0.5">Learners Served</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
                    <span className="text-[11px] text-slate-500 block">Dietary Alerts</span>
                    <span className="text-xl font-bold text-amber-700 tabular-nums">
                      {mealLogs.filter((m) => m.session === currentMealSession && m.flaggedAllergy).length}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Special Diets Given</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
                    <span className="text-[11px] text-slate-500 block">Pending In Stream</span>
                    <span className="text-xl font-bold text-slate-900 tabular-nums">
                      {Math.max(
                        0,
                        students.length - mealLogs.filter((m) => m.session === currentMealSession).length
                      )}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Eligible Remaining</span>
                  </div>
                </div>

                {/* Live Real-time Meal Log Table */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Live Meal Dispensation Audit Log
                      </h3>
                      <p className="text-xs text-slate-500">
                        Chronological tap records for {currentMealSession}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const confirmReset = window.confirm('Clear today&apos;s meal logs for testing?');
                        if (confirmReset) setMealLogs([]);
                      }}
                      className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Reset Session Logs
                    </button>
                  </div>

                  <div className="overflow-x-auto max-h-[460px]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold sticky top-0">
                        <tr>
                          <th className="px-4 py-3">Time</th>
                          <th className="px-4 py-3">Learner</th>
                          <th className="px-4 py-3">Meal Served</th>
                          <th className="px-4 py-3">Dietary Safety</th>
                          <th className="px-4 py-3 text-right">Staff Verified</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {mealLogs.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-slate-400">
                              No meal tap records logged yet for this session. Use the scanner to tap student cards.
                            </td>
                          </tr>
                        ) : (
                          mealLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="px-4 py-3 font-mono font-medium text-slate-600 whitespace-nowrap">
                                {log.timestamp}
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-semibold text-slate-900">{log.studentName}</div>
                                <div className="text-[11px] text-slate-500">{log.grade} · {log.stream}</div>
                              </td>
                              <td className="px-4 py-3 text-slate-700 max-w-[200px] truncate" title={log.dishServed}>
                                {log.dishServed}
                              </td>
                              <td className="px-4 py-3">
                                {log.flaggedAllergy ? (
                                  <span className="inline-block bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                                    {log.flaggedAllergy}
                                  </span>
                                ) : (
                                  <span className="text-slate-500 text-[11px]">Standard Portion</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right font-medium text-slate-600 whitespace-nowrap">
                                <span className="inline-flex items-center gap-1 text-emerald-700">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{log.serverStaff.split(' ')[1] || 'Staff'}</span>
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =======================================================================
            VIEW 4: FEE MANAGEMENT SYSTEM & M-PESA INTEGRATION
            ======================================================================= */}
        {activeTab === 'fees' && (
          <div className="space-y-6">
            {/* Top Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-medium block">Term 1 Expected Fees</span>
                <span className="text-2xl font-bold text-slate-900 tabular-nums">
                  KES {summaryMetrics.totalFeesExpected.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 block mt-1">
                  Tuition, Lunch Levy, CBC Practical Kits
                </span>
              </div>

              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-medium block">Total Fees Collected</span>
                <span className="text-2xl font-bold text-emerald-700 tabular-nums">
                  KES {summaryMetrics.totalFeesPaid.toLocaleString()}
                </span>
                <span className="text-xs text-emerald-700 font-semibold block mt-1">
                  {summaryMetrics.feeCollectionRate}% Collection Efficiency
                </span>
              </div>

              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
                <span className="text-xs text-slate-500 font-medium block">Outstanding Fee Arrears</span>
                <span className="text-2xl font-bold text-rose-700 tabular-nums">
                  KES {summaryMetrics.totalFeesBalance.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 block mt-1">
                  {summaryMetrics.defaulterCount} Defaulters &gt; KES 15,000
                </span>
              </div>

              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium block">M-Pesa Paybill Channel</span>
                  <span className="text-lg font-bold text-slate-900 font-mono">
                    522123 · ZAWADI JSS
                  </span>
                </div>
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="w-full mt-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Simulate M-Pesa Receipt
                </button>
              </div>
            </div>

            {/* Students Fee Ledger Table */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <h3 className="font-semibold text-slate-800">Learner Termly Fee Ledger</h3>
                  <p className="text-slate-500">Real-time balances and Safaricom Paybill verification</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      exportToExcel(
                        'Zawadi_JSS_Term1_Fee_Ledger',
                        students,
                        [
                          { header: 'Learner Name', key: 'name' },
                          { header: 'NEMIS UPI', key: 'nemisUpi' },
                          { header: 'Grade', key: 'grade' },
                          { header: 'Stream', key: 'stream' },
                          { header: 'Guardian Name', key: 'guardianName' },
                          { header: 'Guardian Phone', key: 'guardianPhone' },
                          { header: 'Total Term Fee (KES)', key: (s) => s.fees.totalTermFee },
                          { header: 'Paid Amount (KES)', key: (s) => s.fees.paidAmount },
                          { header: 'Outstanding Balance (KES)', key: (s) => s.fees.balance },
                          { header: 'Fee Status', key: (s) => s.fees.status },
                        ]
                      );
                    }}
                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Export Excel (.csv)
                  </button>
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-500">Breakdown:</span>
                  <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                    {summaryMetrics.clearedCount} Cleared
                  </span>
                  <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-semibold">
                    {summaryMetrics.partialCount} Partial
                  </span>
                  <span className="bg-rose-50 text-rose-800 px-2 py-0.5 rounded font-semibold">
                    {summaryMetrics.defaulterCount} Defaulters
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">Learner & NEMIS</th>
                      <th className="px-4 py-3">Grade/Stream</th>
                      <th className="px-4 py-3">Guardian Contact</th>
                      <th className="px-4 py-3 text-right">Term Fee</th>
                      <th className="px-4 py-3 text-right">Paid</th>
                      <th className="px-4 py-3 text-right">Balance</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{student.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{student.nemisUpi}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-700 font-medium">{student.stream}</td>
                        <td className="px-4 py-3">
                          <div className="text-slate-800 font-medium">{student.guardianName}</div>
                          <div className="text-[11px] text-slate-500">{student.guardianPhone}</div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-600 tabular-nums">
                          KES {student.fees.totalTermFee.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-700 tabular-nums">
                          KES {student.fees.paidAmount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-bold tabular-nums">
                          <span className={student.fees.balance > 0 ? 'text-rose-600' : 'text-slate-400'}>
                            KES {student.fees.balance.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                              student.fees.status === 'Cleared'
                                ? 'bg-emerald-50 text-emerald-700'
                                : student.fees.status === 'Partial'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {student.fees.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setPaymentForm({
                                studentId: student.id,
                                amount: student.fees.balance > 0 ? student.fees.balance : 5000,
                                phone: student.guardianPhone.replace(/\s+/g, ''),
                                payerName: student.guardianName.split('(')[0].trim(),
                                channel: 'M-PESA Paybill',
                              });
                              setIsPaymentModalOpen(true);
                            }}
                            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-2.5 py-1 rounded transition-colors"
                          >
                            Pay Fee
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* M-Pesa Transaction Audit Trail */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <h3 className="font-semibold text-slate-900">M-Pesa & Bank Payment Log</h3>
                  <p className="text-slate-500">Official automated transaction confirmations</p>
                </div>
                <span className="text-slate-400 font-mono">Channel: Daraja API 2.0 Webhook</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">Receipt No</th>
                      <th className="px-4 py-3">M-Pesa Ref</th>
                      <th className="px-4 py-3">Learner</th>
                      <th className="px-4 py-3">Channel</th>
                      <th className="px-4 py-3">Payer Details</th>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-600 font-medium">
                          {tx.receiptNumber}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">
                          {tx.mpesaCode}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">{tx.studentName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{tx.nemisUpi}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-medium">{tx.channel}</td>
                        <td className="px-4 py-3">
                          <div className="text-slate-800">{tx.payerName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{tx.payerPhone}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{tx.date}</td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-700 tabular-nums">
                          KES {tx.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* M-Pesa Record Payment Modal */}
            {isPaymentModalOpen && (
              <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-slate-200">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-emerald-600" />
                      <h3 className="text-base font-bold text-slate-900">Record Fee Payment</h3>
                    </div>
                    <button
                      onClick={() => setIsPaymentModalOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleProcessPayment} className="mt-4 space-y-4 text-xs">
                    <div>
                      <label className="font-medium text-slate-700 block mb-1">Select Learner:</label>
                      <select
                        value={paymentForm.studentId}
                        onChange={(e) => {
                          const std = students.find((s) => s.id === e.target.value);
                          setPaymentForm({
                            ...paymentForm,
                            studentId: e.target.value,
                            amount: std ? (std.fees.balance > 0 ? std.fees.balance : 5000) : 5000,
                            phone: std ? std.guardianPhone.replace(/\s+/g, '') : '',
                            payerName: std ? std.guardianName.split('(')[0].trim() : '',
                          });
                        }}
                        className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        {students.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.stream}) - Bal: KES {s.fees.balance.toLocaleString()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-medium text-slate-700 block mb-1">Amount (KES):</label>
                        <input
                          type="number"
                          required
                          min="500"
                          value={paymentForm.amount}
                          onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                          className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-bold tabular-nums text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="font-medium text-slate-700 block mb-1">Payment Method:</label>
                        <select
                          value={paymentForm.channel}
                          onChange={(e) =>
                            setPaymentForm({ ...paymentForm, channel: e.target.value as typeof paymentForm.channel })
                          }
                          className="w-full border border-slate-300 rounded px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="M-PESA Paybill">M-PESA Paybill (522123)</option>
                          <option value="M-PESA Till">M-PESA Till No</option>
                          <option value="Direct Bank Deposit">Direct Bank (KCB/Equity)</option>
                          <option value="NCBA / KCB Agent">NCBA / KCB Agent</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-medium text-slate-700 block mb-1">Safaricom Mobile (M-Pesa):</label>
                      <input
                        type="tel"
                        required
                        placeholder="+254 7XX XXX XXX"
                        value={paymentForm.phone}
                        onChange={(e) => setPaymentForm({ ...paymentForm, phone: e.target.value })}
                        className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="font-medium text-slate-700 block mb-1">Payer Name (Parent / Guardian):</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Grace Auma"
                        value={paymentForm.payerName}
                        onChange={(e) => setPaymentForm({ ...paymentForm, payerName: e.target.value })}
                        className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="p-3 bg-emerald-50 rounded border border-emerald-200 text-[11px] text-emerald-900">
                      <strong>Automatic Simulation:</strong> Simulates an instant Safaricom M-Pesa push confirmation and generates an authentic Kenya school receipt code.
                    </div>

                    <div className="pt-3 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsPaymentModalOpen(false)}
                        className="px-4 py-2 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-700 text-white rounded text-xs font-semibold hover:bg-emerald-800 transition-colors"
                      >
                        Confirm & Issue Receipt
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* M-PESA SMS CONFIRMATION DIALOG POPUP */}
            {simulatedMpesaAlert && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 border-2 border-emerald-600">
                  <div className="flex items-center gap-2 text-emerald-700 mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                    <span className="font-bold text-base">M-PESA Confirmation Received</span>
                  </div>

                  <div className="bg-slate-900 text-emerald-400 p-4 rounded-lg font-mono text-xs leading-relaxed space-y-2 border border-slate-800">
                    <div>
                      <strong>{simulatedMpesaAlert.code}</strong> Confirmed.
                    </div>
                    <div className="text-slate-200">
                      Ksh {simulatedMpesaAlert.amount.toLocaleString()}.00 received from{' '}
                      <strong>{simulatedMpesaAlert.phone}</strong> for learner{' '}
                      <strong>{simulatedMpesaAlert.studentName}</strong> on {new Date().toLocaleDateString('en-GB')} at{' '}
                      {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}.
                    </div>
                    <div className="text-emerald-300 pt-1 border-t border-slate-800">
                      New Fee Balance: KES {simulatedMpesaAlert.balance.toLocaleString()}.00.
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Official Receipt: {simulatedMpesaAlert.receiptNo}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Student account credited immediately</span>
                    <button
                      onClick={() => setSimulatedMpesaAlert(null)}
                      className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800"
                    >
                      Dismiss SMS
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =======================================================================
            VIEW 5: STUDENT PROFILE & MOE / KNEC ASSESSMENT REPORT CARD (PRINTABLE)
            ======================================================================= */}
        {activeTab === 'report-card' && (
          <div className="space-y-6">
            {/* Learner Picker Toolbar (Hidden on Print) */}
            <div className="no-print bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-700">Select Learner Report:</span>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="text-xs bg-white border border-slate-300 rounded-md px-3 py-2 font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.grade} - {s.stream}) · {s.nemisUpi}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print Official MoE Report Card
                </button>
              </div>
            </div>

            {/* Print-Ready MoE & KNEC CBC Assessment Report Card Container */}
            <div className="print-card bg-white p-8 sm:p-10 rounded-lg border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-6">
              {/* Republic of Kenya MoE Official Letterhead */}
              <div className="text-center border-b-2 border-slate-900 pb-5 space-y-1">
                <div className="text-xs uppercase tracking-widest text-slate-600 font-bold">
                  Republic of Kenya · Ministry of Education
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  State Department for Basic Education · Kenya National Examinations Council (KNEC)
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase mt-2">
                  Zawadi Junior Secondary School
                </h1>
                <div className="text-xs text-slate-600">
                  NEMIS School Code: <strong>20401823</strong> · Sub-County: Westlands · Nairobi County
                </div>
                <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider pt-2">
                  Junior Secondary School (JSS) CBC Learner Assessment & Competency Report
                </div>
                <div className="text-xs text-slate-500">
                  Academic Year: <strong>2026</strong> · Term: <strong>Term 1</strong>
                </div>
              </div>

              {/* Student Biodata Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">Learner Full Name:</span>
                  <strong className="text-slate-900 text-sm">{currentStudent.name}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">NEMIS UPI Number:</span>
                  <strong className="font-mono text-slate-900">{currentStudent.nemisUpi}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Assessment No:</span>
                  <strong className="font-mono text-slate-900">{currentStudent.assessmentNo}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Grade & Stream:</span>
                  <strong className="text-slate-900">{currentStudent.grade} ({currentStudent.stream})</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Gender:</span>
                  <strong className="text-slate-900">{currentStudent.gender}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Date of Birth:</span>
                  <strong className="text-slate-900">{currentStudent.dob}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Term Attendance:</span>
                  <strong className="text-emerald-700 font-bold">{currentStudent.attendancePercent}%</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Meal Card UID:</span>
                  <strong className="font-mono text-slate-900">{currentStudent.smartCardUid}</strong>
                </div>
              </div>

              {/* CBC Learning Areas Assessment Table */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-300 pb-1">
                  1. Core Learning Areas Performance Evaluation (KICD Guidelines)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-300">
                    <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                      <tr>
                        <th className="p-2 border-r border-slate-300">Learning Area</th>
                        <th className="p-2 text-center border-r border-slate-300">Formative</th>
                        <th className="p-2 text-center border-r border-slate-300">Summative (%)</th>
                        <th className="p-2 text-center border-r border-slate-300">Performance Level</th>
                        <th className="p-2">Educator Remarks & Rubric Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {JSS_LEARNING_AREAS.map((subj) => {
                        const ass = currentStudent.assessments[subj.id] || {
                          formative: 'ME',
                          summativeScore: 70,
                          level: 'ME',
                          remarks: 'Meeting expected curriculum milestones.',
                        };
                        const meta = getCBCLevelDescription(ass.level);
                        return (
                          <tr key={subj.id} className="text-slate-800">
                            <td className="p-2 font-medium border-r border-slate-300">
                              {subj.name}
                            </td>
                            <td className="p-2 text-center font-bold border-r border-slate-300">
                              {ass.formative}
                            </td>
                            <td className="p-2 text-center font-mono font-bold border-r border-slate-300 tabular-nums">
                              {ass.summativeScore}%
                            </td>
                            <td className="p-2 text-center font-bold border-r border-slate-300">
                              <span className={`px-2 py-0.5 rounded text-[11px] ${meta.bg}`}>
                                {ass.level} ({ass.level === 'EE' ? 'Exceeding' : ass.level === 'ME' ? 'Meeting' : ass.level === 'AE' ? 'Approaching' : 'Below'})
                              </span>
                            </td>
                            <td className="p-2 text-slate-700 text-[11px] leading-relaxed">
                              {ass.remarks}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CBC Core Competencies Rating Matrix */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 border-b border-slate-300 pb-1">
                  2. Core Competency Appraisal (Scale: 1 - Developing to 5 - Mastered)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  {[
                    { label: 'Communication & Collaboration', score: currentStudent.competencies.communication },
                    { label: 'Critical Thinking & Problem Solving', score: currentStudent.competencies.criticalThinking },
                    { label: 'Digital Literacy', score: currentStudent.competencies.digitalLiteracy },
                    { label: 'Citizenship & National Values', score: currentStudent.competencies.citizenship },
                    { label: 'Creativity & Imagination', score: currentStudent.competencies.creativity },
                    { label: 'Self-Efficacy & Resilience', score: currentStudent.competencies.selfEfficacy },
                  ].map((comp, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded">
                      <div className="flex justify-between font-medium text-slate-800 mb-1">
                        <span>{comp.label}</span>
                        <strong className="text-emerald-700">{comp.score}/5</strong>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${(comp.score / 5) * 100}%` }}
                          className="bg-emerald-600 h-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Values, Conduct & Co-Curricular */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
                  <span className="font-bold text-slate-800 block">Values & Character Conduct:</span>
                  <p className="text-slate-600 leading-relaxed">{currentStudent.valuesNotes}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
                  <span className="font-bold text-slate-800 block">Co-Curricular & Club Participation:</span>
                  <p className="text-slate-600 leading-relaxed">{currentStudent.coCurricular}</p>
                </div>
              </div>

              {/* Official Signatures & Seal Block */}
              <div className="pt-6 border-t-2 border-slate-300 grid grid-cols-2 gap-8 text-xs">
                <div>
                  <div className="h-10 border-b border-dashed border-slate-400"></div>
                  <span className="block mt-1 font-bold text-slate-800">Class Teacher Signature</span>
                  <span className="text-[11px] text-slate-500">Mdm. Grace Ndung’u · TSC/412891</span>
                </div>
                <div className="text-right">
                  <div className="h-10 border-b border-dashed border-slate-400 flex items-end justify-end">
                    <span className="text-[10px] text-emerald-800 uppercase font-bold tracking-widest border border-emerald-700 px-2 py-0.5 rounded mr-2">
                      Official Seal / Stamp
                    </span>
                  </div>
                  <span className="block mt-1 font-bold text-slate-800">Head of Institution (Principal)</span>
                  <span className="text-[11px] text-slate-500">Dr. Anthony K. Macharia · TSC/298410</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =======================================================================
            VIEW 6: TEACHER PERFORMANCE APPRAISAL & DEVELOPMENT (TPAD - TSC KENYA)
            ======================================================================= */}
        {activeTab === 'tpad' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-700" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Teacher Performance Appraisal & Development (TPAD 2.0)
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Teachers Service Commission (TSC Kenya) appraisal framework for Junior Secondary School educators.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded font-semibold">
                  TSC Standard 1 - 5 Scale
                </span>
                <span className="bg-sky-50 text-sky-800 px-2.5 py-1 rounded font-semibold">
                  {teachers.length} Appraised Educators
                </span>
              </div>
            </div>

            {/* Educator KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
                >
                  <div>
                    {/* Header: Name, TSC & Overall Rating */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{teacher.name}</h3>
                        <div className="text-xs text-slate-500 font-mono">{teacher.tscNumber}</div>
                        <div className="text-xs text-emerald-700 font-medium mt-0.5">{teacher.role}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-slate-900 tabular-nums">
                          {teacher.tpadScore}
                          <span className="text-xs text-slate-400">/5.0</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            teacher.tpadScore >= 4.5
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {teacher.status}
                        </span>
                      </div>
                    </div>

                    {/* Metrics Bar */}
                    <div className="mt-4 space-y-2.5 text-xs">
                      <div>
                        <div className="flex justify-between text-slate-600 mb-1">
                          <span>Syllabus Coverage:</span>
                          <strong className="text-slate-900 tabular-nums">{teacher.syllabusCoverage}%</strong>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${teacher.syllabusCoverage}%` }}
                            className="bg-emerald-600 h-full"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                        <div>
                          <span className="text-slate-500 block">Lesson Plans:</span>
                          <strong className="text-slate-800 tabular-nums">
                            {teacher.lessonPlansUploaded} / {teacher.lessonPlansTarget}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Remedial Clinics:</span>
                          <strong className="text-slate-800 tabular-nums">{teacher.remedialSessionsCount} Hours</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">CBC Rubric Fidelity:</span>
                          <strong className="text-slate-800 tabular-nums">{teacher.cbRubricFidelity}%</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Assigned Grades:</span>
                          <strong className="text-slate-800">{teacher.grades.join(', ')}</strong>
                        </div>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded border border-slate-100 text-[11px] text-slate-600 mt-2 italic">
                        &quot;{teacher.observationNotes}&quot;
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="pt-3 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setEvaluatingTeacher(teacher);
                        setTeacherEvalForm({
                          professionalKnowledge: teacher.standards.professionalKnowledge,
                          learnerAssessment: teacher.standards.learnerAssessment,
                          professionalGrowth: teacher.standards.professionalGrowth,
                          remedialAndInclusion: teacher.standards.remedialAndInclusion,
                          safetyAndEthics: teacher.standards.safetyAndEthics,
                          observationNotes: teacher.observationNotes,
                        });
                      }}
                      className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded transition-colors text-center"
                    >
                      Conduct TPAD Observation & Appraisal
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* TPAD Appraisal Evaluation Modal */}
            {evaluatingTeacher && (
              <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 border border-slate-200">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        TPAD 2.0 Evaluation: {evaluatingTeacher.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {evaluatingTeacher.tscNumber} · {evaluatingTeacher.subjects.join(', ')}
                      </p>
                    </div>
                    <button
                      onClick={() => setEvaluatingTeacher(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mt-4 space-y-4 text-xs">
                    {[
                      { key: 'professionalKnowledge', label: '1. Professional Knowledge & Lesson Preparation' },
                      { key: 'learnerAssessment', label: '2. Comprehensive Learner Assessment & CBC Tracking' },
                      { key: 'professionalGrowth', label: '3. Teacher Professional Development (TPD Modules)' },
                      { key: 'remedialAndInclusion', label: '4. Learner Remedial & Special Needs Support' },
                      { key: 'safetyAndEthics', label: '5. Child Protection, Safety & Professional Ethics' },
                    ].map((std) => {
                      const currentVal = teacherEvalForm[std.key as keyof typeof teacherEvalForm] as number;
                      return (
                        <div key={std.key} className="space-y-1">
                          <div className="flex justify-between font-semibold text-slate-800">
                            <span>{std.label}</span>
                            <span className="text-emerald-700 tabular-nums">{currentVal.toFixed(1)} / 5.0</span>
                          </div>
                          <input
                            type="range"
                            min="1.0"
                            max="5.0"
                            step="0.1"
                            value={currentVal}
                            onChange={(e) =>
                              setTeacherEvalForm({
                                ...teacherEvalForm,
                                [std.key]: Number(e.target.value),
                              })
                            }
                            className="w-full accent-emerald-700"
                          />
                        </div>
                      );
                    })}

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Appraiser Termly Observation Notes & Recommendations:
                      </label>
                      <textarea
                        rows={3}
                        value={teacherEvalForm.observationNotes}
                        onChange={(e) =>
                          setTeacherEvalForm({ ...teacherEvalForm, observationNotes: e.target.value })
                        }
                        className="w-full border border-slate-300 rounded p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="Enter constructive pedagogical feedback..."
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex justify-end gap-2">
                    <button
                      onClick={() => setEvaluatingTeacher(null)}
                      className="px-4 py-2 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveTeacherAppraisal}
                      className="px-4 py-2 bg-emerald-700 text-white rounded text-xs font-semibold hover:bg-emerald-800"
                    >
                      Submit TPAD Evaluation
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =======================================================================
            VIEW 7: KITCHEN FOODSTOCK INVENTORY & MANUAL FEEDING TRACKER
            ======================================================================= */}
        {activeTab === 'kitchen-inventory' && (
          <KitchenInventory />
        )}

        {/* =======================================================================
            VIEW 8: MOE TEXTBOOK ISSUANCE & STATIONERY SUPPLIES PLATFORM
            ======================================================================= */}
        {activeTab === 'textbooks-stationery' && (
          <TextbookStationeryPlatform
            students={students.map((s) => ({
              id: s.id,
              name: s.name,
              nemisUpi: s.nemisUpi,
              grade: s.grade,
              stream: s.stream,
            }))}
          />
        )}
      </main>

      {/* =========================================================================
          QUIET FOOTER
          ========================================================================= */}
      <footer className="no-print bg-white border-t border-slate-200 py-4 mt-auto text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Zawadi Junior Secondary School Portal · Integrated with MoE NEMIS & KNEC CBA Standards
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Server: Kenya East Africa Zone</span>
            <span aria-hidden="true">·</span>
            <span>Academic Year 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
