/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  FileSpreadsheet,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  Package,
  Layers,
  ArrowRightLeft,
  X,
  FileText,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { exportToExcel } from '../utils/excelExport';

export interface StudentReference {
  id: string;
  name: string;
  nemisUpi: string;
  grade: string;
  stream: string;
}

export interface TextbookLoan {
  id: string;
  bookTitle: string;
  subjectCode: string;
  gradeLevel: 'Grade 7' | 'Grade 8' | 'Grade 9';
  publisher: 'KLB (Kenya Literature Bureau)' | 'Moran Publishers' | 'Oxford University Press' | 'Longhorn' | 'Spotlight';
  bookBarcode: string; // e.g. KLB-G8-ENG-082
  studentId: string;
  studentName: string;
  nemisUpi: string;
  stream: string;
  dateIssued: string;
  dueDate: string;
  dateReturned?: string;
  conditionIssued: 'Brand New' | 'Good' | 'Fair';
  conditionReturned?: 'Good' | 'Fair' | 'Damaged / Water Marked' | 'Lost';
  status: 'Active on Loan' | 'Returned - Cleared' | 'Overdue' | 'Lost / Penalty Incurred';
  penaltyAmountKes?: number;
}

export interface StationeryItem {
  id: string;
  name: string;
  category: 'Exercise & Graph Books' | 'Writing Instruments' | 'Classroom Chalk & Markers' | 'Maths & Science Kits' | 'Art & Craft Materials';
  stockOnHand: number;
  unit: string;
  reorderLevel: number;
  unitCostKes: number;
  allocatedDepartment: string;
  lastIssuedDate: string;
}

const INITIAL_TEXTBOOK_LOANS: TextbookLoan[] = [
  {
    id: 'tb_01',
    bookTitle: 'Top Mark English Learner’s Book',
    subjectCode: 'ENG-JSS',
    gradeLevel: 'Grade 8',
    publisher: 'KLB (Kenya Literature Bureau)',
    bookBarcode: 'KLB-G8-ENG-0412',
    studentId: 'std_01',
    studentName: 'Brian Omondi Odhiambo',
    nemisUpi: 'NEMIS-7849201',
    stream: '8 Tsavo',
    dateIssued: '2026-09-08',
    dueDate: '2026-11-20',
    conditionIssued: 'Brand New',
    status: 'Active on Loan',
  },
  {
    id: 'tb_02',
    bookTitle: 'Mentor Junior Secondary Mathematics G8',
    subjectCode: 'MAT-JSS',
    gradeLevel: 'Grade 8',
    publisher: 'Moran Publishers',
    bookBarcode: 'MOR-G8-MAT-0199',
    studentId: 'std_01',
    studentName: 'Brian Omondi Odhiambo',
    nemisUpi: 'NEMIS-7849201',
    stream: '8 Tsavo',
    dateIssued: '2026-09-08',
    dueDate: '2026-11-20',
    conditionIssued: 'Good',
    status: 'Active on Loan',
  },
  {
    id: 'tb_03',
    bookTitle: 'Spotlight Integrated Science Learner’s Guide',
    subjectCode: 'SCI-JSS',
    gradeLevel: 'Grade 8',
    publisher: 'Spotlight',
    bookBarcode: 'SPT-G8-SCI-0881',
    studentId: 'std_02',
    studentName: 'Wanjiku Faith Mwangi',
    nemisUpi: 'NEMIS-9104823',
    stream: '8 Tsavo',
    dateIssued: '2026-09-08',
    dueDate: '2026-11-20',
    conditionIssued: 'Brand New',
    status: 'Active on Loan',
  },
  {
    id: 'tb_04',
    bookTitle: 'Longhorn Agriculture & Nutrition Grade 7',
    subjectCode: 'AGR-JSS',
    gradeLevel: 'Grade 7',
    publisher: 'Longhorn',
    bookBarcode: 'LGH-G7-AGR-0034',
    studentId: 'std_03',
    studentName: 'Kevin Kiprono Cheruiyot',
    nemisUpi: 'NEMIS-6302914',
    stream: '7 Mara',
    dateIssued: '2026-05-15',
    dueDate: '2026-08-10',
    conditionIssued: 'Good',
    status: 'Overdue',
  },
  {
    id: 'tb_05',
    bookTitle: 'Oxford Pre-Technical Studies Grade 9',
    subjectCode: 'PTS-JSS',
    gradeLevel: 'Grade 9',
    publisher: 'Oxford University Press',
    bookBarcode: 'OXF-G9-PTS-0912',
    studentId: 'std_04',
    studentName: 'Amina Hassan Noor',
    nemisUpi: 'NEMIS-8201955',
    stream: '9 Turkana',
    dateIssued: '2026-09-10',
    dueDate: '2026-11-20',
    conditionIssued: 'Brand New',
    status: 'Active on Loan',
  },
  {
    id: 'tb_06',
    bookTitle: 'Kiswahili Mufti Ghorofa ya 8',
    subjectCode: 'KIS-JSS',
    gradeLevel: 'Grade 8',
    publisher: 'Longhorn',
    bookBarcode: 'LGH-G8-KIS-0220',
    studentId: 'std_07',
    studentName: 'Denis Wafula Simiyu',
    nemisUpi: 'NEMIS-4820199',
    stream: '8 Serengeti',
    dateIssued: '2026-09-12',
    dueDate: '2026-10-18',
    dateReturned: '2026-10-21',
    conditionIssued: 'Good',
    conditionReturned: 'Good',
    status: 'Returned - Cleared',
  },
];

const INITIAL_STATIONERY: StationeryItem[] = [
  {
    id: 'st_01',
    name: 'A4 Ruled Exercise Books (200 Pages - Kasuku)',
    category: 'Exercise & Graph Books',
    stockOnHand: 480,
    unit: 'Pieces',
    reorderLevel: 150,
    unitCostKes: 120,
    allocatedDepartment: 'General JSS Stores',
    lastIssuedDate: '2026-10-20',
  },
  {
    id: 'st_02',
    name: 'A4 Squared Math Exercise Books (120 Pages)',
    category: 'Exercise & Graph Books',
    stockOnHand: 220,
    unit: 'Pieces',
    reorderLevel: 100,
    unitCostKes: 95,
    allocatedDepartment: 'Mathematics Department',
    lastIssuedDate: '2026-10-18',
  },
  {
    id: 'st_03',
    name: 'Millimeter Metric Graph Exercise Books',
    category: 'Exercise & Graph Books',
    stockOnHand: 45,
    unit: 'Pieces',
    reorderLevel: 60, // Low!
    unitCostKes: 80,
    allocatedDepartment: 'Science & Math Department',
    lastIssuedDate: '2026-10-14',
  },
  {
    id: 'st_04',
    name: 'Bic Fine Ballpoint Pens (Box of 50 - Blue)',
    category: 'Writing Instruments',
    stockOnHand: 18,
    unit: 'Boxes',
    reorderLevel: 5,
    unitCostKes: 950,
    allocatedDepartment: 'Main Academic Office',
    lastIssuedDate: '2026-10-22',
  },
  {
    id: 'st_05',
    name: 'Red Marking Ballpoint Pens (Box of 50)',
    category: 'Writing Instruments',
    stockOnHand: 8,
    unit: 'Boxes',
    reorderLevel: 4,
    unitCostKes: 950,
    allocatedDepartment: 'Staffroom & Teachers',
    lastIssuedDate: '2026-10-19',
  },
  {
    id: 'st_06',
    name: 'Dustless Whiteboard Dry-Erase Markers (Black/Blue)',
    category: 'Classroom Chalk & Markers',
    stockOnHand: 14,
    unit: 'Dozen Packs',
    reorderLevel: 6,
    unitCostKes: 850,
    allocatedDepartment: 'All JSS Streams',
    lastIssuedDate: '2026-10-21',
  },
  {
    id: 'st_07',
    name: 'Oxford Mathematical Geometry Instruments Box',
    category: 'Maths & Science Kits',
    stockOnHand: 65,
    unit: 'Metal Sets',
    reorderLevel: 30,
    unitCostKes: 380,
    allocatedDepartment: 'Mathematics Department',
    lastIssuedDate: '2026-09-15',
  },
  {
    id: 'st_08',
    name: 'Manila Paper Sheets (Assorted Colours)',
    category: 'Art & Craft Materials',
    stockOnHand: 180,
    unit: 'Large Sheets',
    reorderLevel: 50,
    unitCostKes: 25,
    allocatedDepartment: 'Creative Arts & Social Studies',
    lastIssuedDate: '2026-10-17',
  },
];

interface Props {
  students: StudentReference[];
}

export function TextbookStationeryPlatform({ students }: Props) {
  const [loans, setLoans] = useState<TextbookLoan[]>(() => {
    const saved = localStorage.getItem('zawadi_jss_textbook_loans');
    return saved ? JSON.parse(saved) : INITIAL_TEXTBOOK_LOANS;
  });

  const [stationery, setStationery] = useState<StationeryItem[]>(() => {
    const saved = localStorage.getItem('zawadi_jss_stationery');
    return saved ? JSON.parse(saved) : INITIAL_STATIONERY;
  });

  const [activeTab, setActiveTab] = useState<'textbooks' | 'stationery'>('textbooks');
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedLoanForReturn, setSelectedLoanForReturn] = useState<TextbookLoan | null>(null);

  // Issue Form State
  const [issueForm, setIssueForm] = useState({
    studentId: students[0]?.id || 'std_01',
    bookTitle: 'Top Mark English Learner’s Book',
    subjectCode: 'ENG-JSS',
    gradeLevel: 'Grade 8' as TextbookLoan['gradeLevel'],
    publisher: 'KLB (Kenya Literature Bureau)' as TextbookLoan['publisher'],
    bookBarcode: '',
    dueDate: '2026-11-20',
    conditionIssued: 'Brand New' as TextbookLoan['conditionIssued'],
  });

  // Return Form State
  const [returnForm, setReturnForm] = useState({
    conditionReturned: 'Good' as TextbookLoan['conditionReturned'],
    penaltyAmountKes: 0,
    isLost: false,
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('zawadi_jss_textbook_loans', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem('zawadi_jss_stationery', JSON.stringify(stationery));
  }, [stationery]);

  // Derived metrics
  const activeLoansCount = loans.filter((l) => l.status === 'Active on Loan').length;
  const overdueLoansCount = loans.filter((l) => l.status === 'Overdue').length;
  const totalStationeryValueKes = stationery.reduce((sum, s) => sum + s.stockOnHand * s.unitCostKes, 0);

  // Filtered textbook loans
  const filteredLoans = loans.filter((loan) => {
    const matchesSearch =
      loan.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.bookBarcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.nemisUpi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = gradeFilter === 'All' || loan.gradeLevel === gradeFilter;
    const matchesStatus = statusFilter === 'All' || loan.status === statusFilter;
    return matchesSearch && matchesGrade && matchesStatus;
  });

  // Filtered stationery
  const filteredStationery = stationery.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.allocatedDepartment.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Export Textbooks to Excel
  const handleExportTextbooksExcel = () => {
    exportToExcel(
      'Zawadi_JSS_MoE_Textbook_Issuance_Ledger',
      loans,
      [
        { header: 'Book Barcode / Serial', key: 'bookBarcode' },
        { header: 'Textbook Title', key: 'bookTitle' },
        { header: 'Subject Code', key: 'subjectCode' },
        { header: 'Grade Level', key: 'gradeLevel' },
        { header: 'Publisher', key: 'publisher' },
        { header: 'Learner Name', key: 'studentName' },
        { header: 'NEMIS UPI', key: 'nemisUpi' },
        { header: 'Class / Stream', key: 'stream' },
        { header: 'Date Issued', key: 'dateIssued' },
        { header: 'Due Date', key: 'dueDate' },
        { header: 'Date Returned', key: (l) => l.dateReturned || 'N/A' },
        { header: 'Condition on Issue', key: 'conditionIssued' },
        { header: 'Condition on Return', key: (l) => l.conditionReturned || 'N/A' },
        { header: 'Loan Status', key: 'status' },
        { header: 'Penalty (KES)', key: (l) => l.penaltyAmountKes || 0 },
      ]
    );
  };

  // Export Stationery to Excel
  const handleExportStationeryExcel = () => {
    exportToExcel(
      'Zawadi_JSS_Stationery_Inventory',
      stationery,
      [
        { header: 'Item Name', key: 'name' },
        { header: 'Category', key: 'category' },
        { header: 'Stock On Hand', key: 'stockOnHand' },
        { header: 'Unit of Measure', key: 'unit' },
        { header: 'Reorder Level', key: 'reorderLevel' },
        { header: 'Unit Cost (KES)', key: 'unitCostKes' },
        {
          header: 'Total Value (KES)',
          key: (item) => item.stockOnHand * item.unitCostKes,
        },
        { header: 'Allocated Department', key: 'allocatedDepartment' },
        { header: 'Last Issued Date', key: 'lastIssuedDate' },
      ]
    );
  };

  // Submit Issue Book
  const handleIssueBook = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === issueForm.studentId);
    if (!student) return;

    const autoBarcode =
      issueForm.bookBarcode ||
      `${issueForm.publisher.split(' ')[0]}-${issueForm.gradeLevel.replace('Grade ', 'G')}-${issueForm.subjectCode.split('-')[0]}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newLoan: TextbookLoan = {
      id: `tb_${Date.now()}`,
      bookTitle: issueForm.bookTitle,
      subjectCode: issueForm.subjectCode,
      gradeLevel: issueForm.gradeLevel,
      publisher: issueForm.publisher,
      bookBarcode: autoBarcode,
      studentId: student.id,
      studentName: student.name,
      nemisUpi: student.nemisUpi,
      stream: student.stream,
      dateIssued: new Date().toISOString().slice(0, 10),
      dueDate: issueForm.dueDate,
      conditionIssued: issueForm.conditionIssued,
      status: 'Active on Loan',
    };

    setLoans((prev) => [newLoan, ...prev]);
    setIsIssueModalOpen(false);
  };

  // Submit Return Book
  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanForReturn) return;

    const isLost = returnForm.isLost;
    const finalStatus: TextbookLoan['status'] = isLost
      ? 'Lost / Penalty Incurred'
      : 'Returned - Cleared';

    setLoans((prev) =>
      prev.map((l) =>
        l.id === selectedLoanForReturn.id
          ? {
              ...l,
              dateReturned: new Date().toISOString().slice(0, 10),
              conditionReturned: returnForm.conditionReturned,
              status: finalStatus,
              penaltyAmountKes: isLost ? returnForm.penaltyAmountKes || 650 : 0,
            }
          : l
      )
    );

    setIsReturnModalOpen(false);
    setSelectedLoanForReturn(null);
  };

  return (
    <div className="space-y-6">
      {/* Header and Control Zone */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">
              Textbook Issuance & Stationery Management Platform
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official Ministry of Education (MoE) CBC textbook loan tracking, student barcode allocation, and school stationery supplies.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={activeTab === 'textbooks' ? handleExportTextbooksExcel : handleExportStationeryExcel}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export to Excel (.xlsx/.csv)
          </button>

          {activeTab === 'textbooks' && (
            <button
              onClick={() => setIsIssueModalOpen(true)}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Issue Textbook to Student
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Active Textbook Loans</span>
          <span className="text-2xl font-bold text-slate-900 tabular-nums">
            {activeLoansCount} Books
          </span>
          <span className="text-xs text-slate-400 block mt-1">
            Currently issued to JSS learners
          </span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Overdue Books Flagged</span>
          <span className="text-2xl font-bold text-rose-700 tabular-nums">
            {overdueLoansCount} Books
          </span>
          <span className="text-xs text-rose-800 font-medium block mt-1">
            {overdueLoansCount > 0 ? 'Requires guardian SMS notification' : 'No overdue records'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Total Stationery Value</span>
          <span className="text-2xl font-bold text-slate-900 tabular-nums">
            KES {totalStationeryValueKes.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 block mt-1">
            Exercise books, chalk & math sets
          </span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">MoE CBC Publishers</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded">KLB</span>
            <span className="text-xs font-semibold bg-sky-50 text-sky-800 px-2 py-0.5 rounded">Moran</span>
            <span className="text-xs font-semibold bg-amber-50 text-amber-800 px-2 py-0.5 rounded">Oxford</span>
          </div>
          <span className="text-xs text-slate-400 block mt-1">Standard KICD approved titles</span>
        </div>
      </div>

      {/* Main Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('textbooks')}
          className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'textbooks'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          MoE Textbook Issuance Platform ({loans.length})
        </button>

        <button
          onClick={() => setActiveTab('stationery')}
          className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'stationery'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Stationery & Classroom Supplies ({stationery.length})
        </button>
      </div>

      {/* =========================================================================
          TAB 1: TEXTBOOK ISSUANCE PLATFORM
          ========================================================================= */}
      {activeTab === 'textbooks' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          {/* Filters Bar */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search title, student name, NEMIS or barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                <option value="All">All Grades</option>
                <option value="Grade 7">Grade 7</option>
                <option value="Grade 8">Grade 8</option>
                <option value="Grade 9">Grade 9</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                <option value="All">All Loan Statuses</option>
                <option value="Active on Loan">Active on Loan</option>
                <option value="Returned - Cleared">Returned - Cleared</option>
                <option value="Overdue">Overdue</option>
                <option value="Lost / Penalty Incurred">Lost / Penalty</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Book Barcode & Title</th>
                  <th className="px-4 py-3">Publisher & Grade</th>
                  <th className="px-4 py-3">Issued Learner</th>
                  <th className="px-4 py-3">Issue Date</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Condition</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLoans.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400">
                      No matching textbook issuance records found.
                    </td>
                  </tr>
                ) : (
                  filteredLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{loan.bookTitle}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{loan.bookBarcode}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <div>{loan.publisher}</div>
                        <span className="text-[11px] text-slate-500 font-medium">{loan.gradeLevel}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{loan.studentName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {loan.stream} · {loan.nemisUpi}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-mono">{loan.dateIssued}</td>
                      <td className="px-4 py-3 text-slate-600 font-mono">{loan.dueDate}</td>
                      <td className="px-4 py-3">
                        <span className="text-slate-700 font-medium">{loan.conditionIssued}</span>
                        {loan.conditionReturned && (
                          <div className="text-[10px] text-slate-500">
                            Returned: {loan.conditionReturned}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            loan.status === 'Active on Loan'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : loan.status === 'Returned - Cleared'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : loan.status === 'Overdue'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {loan.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {loan.status === 'Active on Loan' || loan.status === 'Overdue' ? (
                          <button
                            onClick={() => {
                              setSelectedLoanForReturn(loan);
                              setIsReturnModalOpen(true);
                            }}
                            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-2.5 py-1 rounded transition-colors"
                          >
                            Return Book
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Archived</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: STATIONERY & SUPPLIES INVENTORY TABLE
          ========================================================================= */}
      {activeTab === 'stationery' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search stationery, category or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <span className="text-slate-500">
              Total Stocked Items: <strong className="text-slate-800">{stationery.length}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Stationery Item</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Stock on Hand</th>
                  <th className="px-4 py-3 text-right">Reorder Level</th>
                  <th className="px-4 py-3 text-right">Unit Cost (KES)</th>
                  <th className="px-4 py-3 text-right">Total Value (KES)</th>
                  <th className="px-4 py-3">Allocated Dept</th>
                  <th className="px-4 py-3 text-right">Quick Dispense</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStationery.map((item) => {
                  const isLow = item.stockOnHand <= item.reorderLevel;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900">{item.name}</td>
                      <td className="px-4 py-3 text-slate-600">{item.category}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900 tabular-nums">
                        {item.stockOnHand} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500 tabular-nums">
                        {item.reorderLevel} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600 font-medium tabular-nums">
                        KES {item.unitCostKes.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-800 tabular-nums">
                        KES {(item.stockOnHand * item.unitCostKes).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-slate-700 font-medium">{item.allocatedDepartment}</span>
                        <div className="text-[10px] text-slate-400">Issued: {item.lastIssuedDate}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => {
                              setStationery((prev) =>
                                prev.map((s) =>
                                  s.id === item.id ? { ...s, stockOnHand: s.stockOnHand + 20 } : s
                                )
                              );
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[11px]"
                            title="Add 20 units"
                          >
                            +20
                          </button>
                          <button
                            onClick={() => {
                              setStationery((prev) =>
                                prev.map((s) =>
                                  s.id === item.id
                                    ? {
                                        ...s,
                                        stockOnHand: Math.max(0, s.stockOnHand - 5),
                                        lastIssuedDate: new Date().toISOString().slice(0, 10),
                                      }
                                    : s
                                )
                              );
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded font-semibold text-[11px]"
                            title="Issue 5 units to class"
                          >
                            -5
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ISSUE TEXTBOOK
          ========================================================================= */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">Issue Textbook to Learner</h3>
              </div>
              <button
                onClick={() => setIsIssueModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueBook} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Learner:</label>
                <select
                  value={issueForm.studentId}
                  onChange={(e) => setIssueForm({ ...issueForm, studentId: e.target.value })}
                  className="w-full border border-slate-300 rounded px-2.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.stream}) · {s.nemisUpi}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Textbook Title:</label>
                <input
                  type="text"
                  required
                  value={issueForm.bookTitle}
                  onChange={(e) => setIssueForm({ ...issueForm, bookTitle: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Grade Level:</label>
                  <select
                    value={issueForm.gradeLevel}
                    onChange={(e) =>
                      setIssueForm({ ...issueForm, gradeLevel: e.target.value as TextbookLoan['gradeLevel'] })
                    }
                    className="w-full border border-slate-300 rounded px-2.5 py-2 text-xs text-slate-800"
                  >
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Publisher:</label>
                  <select
                    value={issueForm.publisher}
                    onChange={(e) =>
                      setIssueForm({ ...issueForm, publisher: e.target.value as TextbookLoan['publisher'] })
                    }
                    className="w-full border border-slate-300 rounded px-2.5 py-2 text-xs text-slate-800"
                  >
                    <option value="KLB (Kenya Literature Bureau)">KLB</option>
                    <option value="Moran Publishers">Moran</option>
                    <option value="Oxford University Press">Oxford</option>
                    <option value="Longhorn">Longhorn</option>
                    <option value="Spotlight">Spotlight</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Barcode / Copy No:</label>
                  <input
                    type="text"
                    placeholder="Leave blank for auto"
                    value={issueForm.bookBarcode}
                    onChange={(e) => setIssueForm({ ...issueForm, bookBarcode: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Due Date:</label>
                  <input
                    type="date"
                    required
                    value={issueForm.dueDate}
                    onChange={(e) => setIssueForm({ ...issueForm, dueDate: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white rounded text-xs font-semibold hover:bg-emerald-800"
                >
                  Issue & Assign Serial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: RETURN TEXTBOOK
          ========================================================================= */}
      {isReturnModalOpen && selectedLoanForReturn && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Return Textbook Inspection</h3>
                <p className="text-xs text-slate-500">
                  {selectedLoanForReturn.bookTitle} · {selectedLoanForReturn.bookBarcode}
                </p>
              </div>
              <button
                onClick={() => setIsReturnModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReturn} className="mt-4 space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                <div>Learner: <strong>{selectedLoanForReturn.studentName}</strong> ({selectedLoanForReturn.stream})</div>
                <div>NEMIS UPI: <span className="font-mono">{selectedLoanForReturn.nemisUpi}</span></div>
                <div>Issued on: <strong>{selectedLoanForReturn.dateIssued}</strong> (Condition: {selectedLoanForReturn.conditionIssued})</div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Returned Physical Condition:</label>
                <select
                  value={returnForm.conditionReturned}
                  onChange={(e) =>
                    setReturnForm({
                      ...returnForm,
                      conditionReturned: e.target.value as TextbookLoan['conditionReturned'],
                    })
                  }
                  className="w-full border border-slate-300 rounded px-2.5 py-2 text-xs text-slate-900 font-medium"
                >
                  <option value="Good">Good (Normal wear, no torn pages)</option>
                  <option value="Fair">Fair (Readable, slight creases)</option>
                  <option value="Damaged / Water Marked">Damaged / Water Marked / Torn Cover</option>
                  <option value="Lost">Lost by Learner</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_lost_checkbox"
                  checked={returnForm.isLost}
                  onChange={(e) => setReturnForm({ ...returnForm, isLost: e.target.checked })}
                  className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-500"
                />
                <label htmlFor="is_lost_checkbox" className="font-medium text-slate-800">
                  Mark as Lost or Severe Damage (Requires Penalty)
                </label>
              </div>

              {returnForm.isLost && (
                <div>
                  <label className="font-semibold text-rose-700 block mb-1">Replacement Fee (KES):</label>
                  <input
                    type="number"
                    min="100"
                    value={returnForm.penaltyAmountKes || 650}
                    onChange={(e) => setReturnForm({ ...returnForm, penaltyAmountKes: Number(e.target.value) })}
                    className="w-full border border-rose-300 rounded px-3 py-2 text-xs font-bold tabular-nums text-rose-900"
                  />
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Standard MoE book replacement levy charged to parent.
                  </span>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white rounded text-xs font-semibold hover:bg-emerald-800"
                >
                  Clear Return & Update Records
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
