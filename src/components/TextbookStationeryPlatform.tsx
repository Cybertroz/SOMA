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
  Printer,
  Upload,
  BookMarked,
  BookmarkX,
  Edit3,
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

export interface AvailableBookCatalogItem {
  id: string;
  title: string;
  subjectCode: string;
  gradeLevel: 'Grade 7' | 'Grade 8' | 'Grade 9';
  publisher: 'KLB (Kenya Literature Bureau)' | 'Moran Publishers' | 'Oxford University Press' | 'Longhorn' | 'Spotlight';
  totalCopies: number;
  availableCopies: number;
  onLoanCopies: number;
  lostCopies: number;
  unitValueKes: number;
  shelfLocation: string;
}

export interface LostBookRecord {
  id: string;
  bookBarcode: string;
  bookTitle: string;
  subjectCode: string;
  gradeLevel: string;
  studentName: string;
  nemisUpi: string;
  stream: string;
  dateReportedLost: string;
  replacementCostKes: number;
  paymentStatus: 'Pending Settlement' | 'Cleared by Parent' | 'Waived by Headteacher';
  receiptRef?: string;
  notes?: string;
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
  supplier?: string;
}

const INITIAL_AVAILABLE_BOOKS: AvailableBookCatalogItem[] = [
  {
    id: 'ab_01',
    title: 'Top Mark English Learner’s Book',
    subjectCode: 'ENG-JSS',
    gradeLevel: 'Grade 8',
    publisher: 'KLB (Kenya Literature Bureau)',
    totalCopies: 120,
    availableCopies: 104,
    onLoanCopies: 15,
    lostCopies: 1,
    unitValueKes: 680,
    shelfLocation: 'Cabinet A-1, Stack 3',
  },
  {
    id: 'ab_02',
    title: 'Mentor Junior Secondary Mathematics G8',
    subjectCode: 'MAT-JSS',
    gradeLevel: 'Grade 8',
    publisher: 'Moran Publishers',
    totalCopies: 130,
    availableCopies: 112,
    onLoanCopies: 17,
    lostCopies: 1,
    unitValueKes: 720,
    shelfLocation: 'Cabinet A-2, Stack 1',
  },
  {
    id: 'ab_03',
    title: 'Spotlight Integrated Science Learner’s Guide',
    subjectCode: 'SCI-JSS',
    gradeLevel: 'Grade 8',
    publisher: 'Spotlight',
    totalCopies: 110,
    availableCopies: 96,
    onLoanCopies: 14,
    lostCopies: 0,
    unitValueKes: 750,
    shelfLocation: 'Cabinet B-1, Stack 2',
  },
  {
    id: 'ab_04',
    title: 'Longhorn Agriculture & Nutrition Grade 7',
    subjectCode: 'AGR-JSS',
    gradeLevel: 'Grade 7',
    publisher: 'Longhorn',
    totalCopies: 95,
    availableCopies: 82,
    onLoanCopies: 12,
    lostCopies: 1,
    unitValueKes: 650,
    shelfLocation: 'Cabinet C-1, Stack 4',
  },
  {
    id: 'ab_05',
    title: 'Oxford Pre-Technical Studies Grade 9',
    subjectCode: 'PTS-JSS',
    gradeLevel: 'Grade 9',
    publisher: 'Oxford University Press',
    totalCopies: 85,
    availableCopies: 73,
    onLoanCopies: 12,
    lostCopies: 0,
    unitValueKes: 780,
    shelfLocation: 'Cabinet D-2, Stack 1',
  },
  {
    id: 'ab_06',
    title: 'Kiswahili Mufti Ghorofa ya 8',
    subjectCode: 'KIS-JSS',
    gradeLevel: 'Grade 8',
    publisher: 'Longhorn',
    totalCopies: 115,
    availableCopies: 101,
    onLoanCopies: 14,
    lostCopies: 0,
    unitValueKes: 640,
    shelfLocation: 'Cabinet A-3, Stack 2',
  },
];

const INITIAL_LOST_BOOKS: LostBookRecord[] = [
  {
    id: 'lb_01',
    bookBarcode: 'KLB-G8-ENG-0319',
    bookTitle: 'Top Mark English Learner’s Book',
    subjectCode: 'ENG-JSS',
    gradeLevel: 'Grade 8',
    studentName: 'Mercy Achieng Otieno',
    nemisUpi: 'NEMIS-5192837',
    stream: '8 Tsavo',
    dateReportedLost: '2026-10-15',
    replacementCostKes: 680,
    paymentStatus: 'Cleared by Parent',
    receiptRef: 'RCT-2026-B812',
    notes: 'Paid via direct bank deposit; replacement copy ordered from KLB.',
  },
  {
    id: 'lb_02',
    bookBarcode: 'MOR-G8-MAT-0082',
    bookTitle: 'Mentor Junior Secondary Mathematics G8',
    subjectCode: 'MAT-JSS',
    gradeLevel: 'Grade 8',
    studentName: 'Kelvin Kiprono Cheruiyot',
    nemisUpi: 'NEMIS-6302914',
    stream: '7 Mara',
    dateReportedLost: '2026-10-19',
    replacementCostKes: 720,
    paymentStatus: 'Pending Settlement',
    notes: 'Guardian SMS reminder sent on 2026-10-20.',
  },
];

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
  const [catalogBooks, setCatalogBooks] = useState<AvailableBookCatalogItem[]>(() => {
    const saved = localStorage.getItem('zawadi_jss_catalog_books');
    return saved ? JSON.parse(saved) : INITIAL_AVAILABLE_BOOKS;
  });

  const [loans, setLoans] = useState<TextbookLoan[]>(() => {
    const saved = localStorage.getItem('zawadi_jss_textbook_loans');
    return saved ? JSON.parse(saved) : INITIAL_TEXTBOOK_LOANS;
  });

  const [lostBooks, setLostBooks] = useState<LostBookRecord[]>(() => {
    const saved = localStorage.getItem('zawadi_jss_lost_books');
    return saved ? JSON.parse(saved) : INITIAL_LOST_BOOKS;
  });

  const [stationery, setStationery] = useState<StationeryItem[]>(() => {
    const saved = localStorage.getItem('zawadi_jss_stationery');
    return saved ? JSON.parse(saved) : INITIAL_STATIONERY;
  });

  const [activeTab, setActiveTab] = useState<'catalog' | 'loans' | 'lost' | 'stationery'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [isAddStationeryModalOpen, setIsAddStationeryModalOpen] = useState(false);
  const [isReportLostModalOpen, setIsReportLostModalOpen] = useState(false);
  const [selectedLoanForReturn, setSelectedLoanForReturn] = useState<TextbookLoan | null>(null);

  // Forms
  const [newBookForm, setNewBookForm] = useState({
    title: '',
    subjectCode: 'ENG-JSS',
    gradeLevel: 'Grade 8' as AvailableBookCatalogItem['gradeLevel'],
    publisher: 'KLB (Kenya Literature Bureau)' as AvailableBookCatalogItem['publisher'],
    totalCopies: 50,
    unitValueKes: 680,
    shelfLocation: 'Cabinet A-1, Stack 1',
  });

  const [newStationeryForm, setNewStationeryForm] = useState({
    name: '',
    category: 'Exercise & Graph Books' as StationeryItem['category'],
    stockOnHand: 100,
    unit: 'Pieces',
    reorderLevel: 25,
    unitCostKes: 120,
    allocatedDepartment: 'General JSS Stores',
    supplier: 'Kasuku Paper Mills Ltd',
  });

  const [lostBookForm, setLostBookForm] = useState({
    bookBarcode: '',
    bookTitle: 'Top Mark English Learner’s Book',
    subjectCode: 'ENG-JSS',
    gradeLevel: 'Grade 8',
    studentName: students[0]?.name || 'Brian Omondi Odhiambo',
    nemisUpi: students[0]?.nemisUpi || 'NEMIS-7849201',
    stream: students[0]?.stream || '8 Tsavo',
    replacementCostKes: 680,
    notes: 'Missing following end-of-term inspection.',
  });

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

  const [returnForm, setReturnForm] = useState({
    conditionReturned: 'Good' as TextbookLoan['conditionReturned'],
    penaltyAmountKes: 0,
    isLost: false,
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('zawadi_jss_catalog_books', JSON.stringify(catalogBooks));
  }, [catalogBooks]);

  useEffect(() => {
    localStorage.setItem('zawadi_jss_textbook_loans', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem('zawadi_jss_lost_books', JSON.stringify(lostBooks));
  }, [lostBooks]);

  useEffect(() => {
    localStorage.setItem('zawadi_jss_stationery', JSON.stringify(stationery));
  }, [stationery]);

  // Derived metrics
  const totalCatalogCopies = catalogBooks.reduce((sum, b) => sum + b.totalCopies, 0);
  const totalAvailableCopies = catalogBooks.reduce((sum, b) => sum + b.availableCopies, 0);
  const activeLoansCount = loans.filter((l) => l.status === 'Active on Loan').length;
  const overdueLoansCount = loans.filter((l) => l.status === 'Overdue').length;
  const totalLostCount = lostBooks.length;
  const totalLostPenaltiesKes = lostBooks.reduce((sum, l) => sum + l.replacementCostKes, 0);
  const totalStationeryValueKes = stationery.reduce((sum, s) => sum + s.stockOnHand * s.unitCostKes, 0);

  // Filtered lists
  const filteredCatalog = catalogBooks.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.publisher.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.shelfLocation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = gradeFilter === 'All' || b.gradeLevel === gradeFilter;
    return matchesSearch && matchesGrade;
  });

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

  const filteredLostBooks = lostBooks.filter((l) =>
    l.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.bookBarcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.nemisUpi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStationery = stationery.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.allocatedDepartment.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Export handlers
  const handleExportDataExcel = () => {
    if (activeTab === 'catalog') {
      exportToExcel('Zawadi_JSS_Available_Textbooks_Catalog', catalogBooks, [
        { header: 'Book Title', key: 'title' },
        { header: 'Subject Code', key: 'subjectCode' },
        { header: 'Grade Level', key: 'gradeLevel' },
        { header: 'Publisher', key: 'publisher' },
        { header: 'Total Copies', key: 'totalCopies' },
        { header: 'Available on Shelf', key: 'availableCopies' },
        { header: 'On Loan to Learners', key: 'onLoanCopies' },
        { header: 'Lost Copies', key: 'lostCopies' },
        { header: 'Unit Replacement Value (KES)', key: 'unitValueKes' },
        { header: 'Shelf / Stack Location', key: 'shelfLocation' },
      ]);
    } else if (activeTab === 'loans') {
      exportToExcel('Zawadi_JSS_Textbook_Loans_Register', loans, [
        { header: 'Barcode / Copy No', key: 'bookBarcode' },
        { header: 'Textbook Title', key: 'bookTitle' },
        { header: 'Subject Code', key: 'subjectCode' },
        { header: 'Grade', key: 'gradeLevel' },
        { header: 'Publisher', key: 'publisher' },
        { header: 'Learner Name', key: 'studentName' },
        { header: 'NEMIS UPI', key: 'nemisUpi' },
        { header: 'Stream', key: 'stream' },
        { header: 'Date Issued', key: 'dateIssued' },
        { header: 'Due Date', key: 'dueDate' },
        { header: 'Status', key: 'status' },
      ]);
    } else if (activeTab === 'lost') {
      exportToExcel('Zawadi_JSS_Lost_Books_Registry', lostBooks, [
        { header: 'Barcode', key: 'bookBarcode' },
        { header: 'Textbook Title', key: 'bookTitle' },
        { header: 'Subject Code', key: 'subjectCode' },
        { header: 'Grade', key: 'gradeLevel' },
        { header: 'Student Name', key: 'studentName' },
        { header: 'NEMIS UPI', key: 'nemisUpi' },
        { header: 'Stream', key: 'stream' },
        { header: 'Date Reported Lost', key: 'dateReportedLost' },
        { header: 'Penalty Amount (KES)', key: 'replacementCostKes' },
        { header: 'Settlement Status', key: 'paymentStatus' },
        { header: 'Receipt / Ref', key: (l) => l.receiptRef || 'N/A' },
      ]);
    } else {
      exportToExcel('Zawadi_JSS_Stationery_Inventory', stationery, [
        { header: 'Item Name', key: 'name' },
        { header: 'Category', key: 'category' },
        { header: 'Stock On Hand', key: 'stockOnHand' },
        { header: 'Unit of Measure', key: 'unit' },
        { header: 'Reorder Level', key: 'reorderLevel' },
        { header: 'Unit Cost (KES)', key: 'unitCostKes' },
        { header: 'Total Value (KES)', key: (item) => item.stockOnHand * item.unitCostKes },
        { header: 'Department', key: 'allocatedDepartment' },
      ]);
    }
  };

  // Add Available Book
  const handleAddAvailableBook = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = catalogBooks.find(
      (b) => b.title.toLowerCase() === newBookForm.title.toLowerCase() && b.gradeLevel === newBookForm.gradeLevel
    );

    if (existing) {
      setCatalogBooks((prev) =>
        prev.map((b) =>
          b.id === existing.id
            ? {
                ...b,
                totalCopies: b.totalCopies + Number(newBookForm.totalCopies),
                availableCopies: b.availableCopies + Number(newBookForm.totalCopies),
                unitValueKes: Number(newBookForm.unitValueKes),
                shelfLocation: newBookForm.shelfLocation || b.shelfLocation,
              }
            : b
        )
      );
      setToastMessage(`Restocked ${newBookForm.totalCopies} copies of ${existing.title}. Total available: ${existing.availableCopies + Number(newBookForm.totalCopies)}.`);
    } else {
      const newBook: AvailableBookCatalogItem = {
        id: `ab_${Date.now()}`,
        title: newBookForm.title,
        subjectCode: newBookForm.subjectCode,
        gradeLevel: newBookForm.gradeLevel,
        publisher: newBookForm.publisher,
        totalCopies: Number(newBookForm.totalCopies),
        availableCopies: Number(newBookForm.totalCopies),
        onLoanCopies: 0,
        lostCopies: 0,
        unitValueKes: Number(newBookForm.unitValueKes),
        shelfLocation: newBookForm.shelfLocation,
      };
      setCatalogBooks((prev) => [newBook, ...prev]);
      setToastMessage(`Added new textbook "${newBookForm.title}" (${newBookForm.totalCopies} copies) to library catalog.`);
    }

    setIsAddBookModalOpen(false);
    setNewBookForm({
      title: '',
      subjectCode: 'ENG-JSS',
      gradeLevel: 'Grade 8',
      publisher: 'KLB (Kenya Literature Bureau)',
      totalCopies: 50,
      unitValueKes: 680,
      shelfLocation: 'Cabinet A-1, Stack 1',
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Add Stationery Bought
  const handleAddStationeryBought = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(newStationeryForm.stockOnHand);
    const unitPrice = Number(newStationeryForm.unitCostKes);
    const totalSpent = qty * unitPrice;

    const existing = stationery.find((s) => s.name.toLowerCase() === newStationeryForm.name.toLowerCase());
    if (existing) {
      setStationery((prev) =>
        prev.map((s) =>
          s.id === existing.id
            ? {
                ...s,
                stockOnHand: s.stockOnHand + qty,
                unitCostKes: unitPrice,
                lastIssuedDate: new Date().toISOString().slice(0, 10),
              }
            : s
        )
      );
      setToastMessage(`Recorded purchase of ${qty} ${newStationeryForm.unit} of ${existing.name} (KES ${totalSpent.toLocaleString()}). Store value updated!`);
    } else {
      const newItem: StationeryItem = {
        id: `st_${Date.now()}`,
        name: newStationeryForm.name,
        category: newStationeryForm.category,
        stockOnHand: qty,
        unit: newStationeryForm.unit,
        reorderLevel: Number(newStationeryForm.reorderLevel),
        unitCostKes: unitPrice,
        allocatedDepartment: newStationeryForm.allocatedDepartment,
        lastIssuedDate: new Date().toISOString().slice(0, 10),
        supplier: newStationeryForm.supplier,
      };
      setStationery((prev) => [newItem, ...prev]);
      setToastMessage(`Added newly bought stationery "${newStationeryForm.name}" (KES ${totalSpent.toLocaleString()}). Store value updated!`);
    }

    setIsAddStationeryModalOpen(false);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Report Lost Book (Tabulated in System)
  const handleReportLostBook = (e: React.FormEvent) => {
    e.preventDefault();
    const barcode = lostBookForm.bookBarcode || `LOST-${Math.floor(1000 + Math.random() * 9000)}`;

    const newLostRecord: LostBookRecord = {
      id: `lb_${Date.now()}`,
      bookBarcode: barcode,
      bookTitle: lostBookForm.bookTitle,
      subjectCode: lostBookForm.subjectCode,
      gradeLevel: lostBookForm.gradeLevel,
      studentName: lostBookForm.studentName,
      nemisUpi: lostBookForm.nemisUpi,
      stream: lostBookForm.stream,
      dateReportedLost: new Date().toISOString().slice(0, 10),
      replacementCostKes: Number(lostBookForm.replacementCostKes),
      paymentStatus: 'Pending Settlement',
      notes: lostBookForm.notes,
    };

    setLostBooks((prev) => [newLostRecord, ...prev]);

    // Update catalog count: deduct 1 from available/total and add 1 to lost
    setCatalogBooks((prev) =>
      prev.map((b) =>
        b.title.toLowerCase() === lostBookForm.bookTitle.toLowerCase()
          ? {
              ...b,
              availableCopies: Math.max(0, b.availableCopies - 1),
              lostCopies: b.lostCopies + 1,
            }
          : b
      )
    );

    setIsReportLostModalOpen(false);
    setToastMessage(`Lost book "${lostBookForm.bookTitle}" (Barcode: ${barcode}) registered in lost ledger. Replacement fee of KES ${lostBookForm.replacementCostKes} billed to parent.`);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Issue Book
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

    // Update catalog onLoanCopies and availableCopies
    setCatalogBooks((prev) =>
      prev.map((b) =>
        b.title.toLowerCase() === issueForm.bookTitle.toLowerCase()
          ? {
              ...b,
              availableCopies: Math.max(0, b.availableCopies - 1),
              onLoanCopies: b.onLoanCopies + 1,
            }
          : b
      )
    );

    setIsIssueModalOpen(false);
    setToastMessage(`Issued ${issueForm.bookTitle} (${autoBarcode}) to ${student.name}. Available count updated.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Return Book
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
              penaltyAmountKes: isLost ? returnForm.penaltyAmountKes || 680 : 0,
            }
          : l
      )
    );

    if (isLost) {
      // Tabulate in lost books system
      const newLost: LostBookRecord = {
        id: `lb_${Date.now()}`,
        bookBarcode: selectedLoanForReturn.bookBarcode,
        bookTitle: selectedLoanForReturn.bookTitle,
        subjectCode: selectedLoanForReturn.subjectCode,
        gradeLevel: selectedLoanForReturn.gradeLevel,
        studentName: selectedLoanForReturn.studentName,
        nemisUpi: selectedLoanForReturn.nemisUpi,
        stream: selectedLoanForReturn.stream,
        dateReportedLost: new Date().toISOString().slice(0, 10),
        replacementCostKes: returnForm.penaltyAmountKes || 680,
        paymentStatus: 'Pending Settlement',
        notes: `Returned during book clearance; marked lost/damaged by teacher.`,
      };
      setLostBooks((prev) => [newLost, ...prev]);

      // Deduct from catalog
      setCatalogBooks((prev) =>
        prev.map((b) =>
          b.title.toLowerCase() === selectedLoanForReturn.bookTitle.toLowerCase()
            ? { ...b, onLoanCopies: Math.max(0, b.onLoanCopies - 1), lostCopies: b.lostCopies + 1 }
            : b
        )
      );
      setToastMessage(`Marked ${selectedLoanForReturn.bookTitle} as lost. Tabulated in Lost Books Register.`);
    } else {
      // Restock to available
      setCatalogBooks((prev) =>
        prev.map((b) =>
          b.title.toLowerCase() === selectedLoanForReturn.bookTitle.toLowerCase()
            ? { ...b, onLoanCopies: Math.max(0, b.onLoanCopies - 1), availableCopies: b.availableCopies + 1 }
            : b
        )
      );
      setToastMessage(`Returned ${selectedLoanForReturn.bookTitle} from ${selectedLoanForReturn.studentName}. Available stock replenished.`);
    }

    setIsReturnModalOpen(false);
    setSelectedLoanForReturn(null);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // CSV Import
  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        setToastMessage('Imported CSV was empty or contained no rows.');
        setTimeout(() => setToastMessage(null), 3000);
        return;
      }

      setToastMessage(`Imported ${lines.length - 1} records from ${file.name}. Ledgers updated.`);
      setTimeout(() => setToastMessage(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-emerald-900 text-white px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header and Control Zone */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">
              Textbook Store, Available Books & Stationery Register
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ministry of Education (MoE) CBC library inventory, stock on shelf, student loans, and official lost books registry.
          </p>
        </div>

        {/* Action Buttons: Print, Excel, Upload, Add Books, Add Stationery */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Print Register */}
          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-300"
            title="Print Current Register"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Register
          </button>

          {/* Export to Excel */}
          <button
            onClick={handleExportDataExcel}
            className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export (.csv)
          </button>

          {/* Upload CSV */}
          <label className="cursor-pointer px-3 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload (.csv)</span>
            <input type="file" accept=".csv,.txt" onChange={handleImportCsv} className="hidden" />
          </label>

          {/* Add Available Books Button */}
          <button
            onClick={() => setIsAddBookModalOpen(true)}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <BookMarked className="w-3.5 h-3.5" />
            Add Available Books
          </button>

          {/* Add Stationery Bought Button */}
          <button
            onClick={() => setIsAddStationeryModalOpen(true)}
            className="px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Stationery Bought
          </button>

          {/* Report Lost Book Button */}
          <button
            onClick={() => setIsReportLostModalOpen(true)}
            className="px-3 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <BookmarkX className="w-3.5 h-3.5" />
            Report Lost Book
          </button>

          {/* Issue Textbook */}
          <button
            onClick={() => setIsIssueModalOpen(true)}
            className="px-3 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Issue to Learner
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Available Books on Shelf</span>
          <span className="text-2xl font-bold text-slate-900 tabular-nums">
            {totalAvailableCopies} Copies
          </span>
          <span className="text-xs text-slate-400 block mt-1">
            Out of {totalCatalogCopies} total copies across {catalogBooks.length} titles
          </span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Active Loans to Learners</span>
          <span className="text-2xl font-bold text-sky-700 tabular-nums">
            {activeLoansCount} Books
          </span>
          <span className="text-xs text-sky-800 font-medium block mt-1">
            {overdueLoansCount > 0 ? `${overdueLoansCount} overdue books flagged` : 'All loans within due date'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Lost & Damaged Register</span>
          <span className="text-2xl font-bold text-rose-700 tabular-nums">
            {totalLostCount} Books
          </span>
          <span className="text-xs text-rose-800 font-medium block mt-1">
            KES {totalLostPenaltiesKes.toLocaleString()} in parent replacement levies
          </span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Stationery Stores Valuation</span>
          <span className="text-2xl font-bold text-emerald-800 tabular-nums">
            KES {totalStationeryValueKes.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 block mt-1">
            {stationery.length} stocked item lines in store
          </span>
        </div>
      </div>

      {/* Main Switcher Tabs (4 tabs) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'catalog'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookMarked className="w-3.5 h-3.5" />
          Available Books Catalog & Stock ({catalogBooks.length})
        </button>

        <button
          onClick={() => setActiveTab('loans')}
          className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'loans'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Active Learner Loans ({loans.length})
        </button>

        <button
          onClick={() => setActiveTab('lost')}
          className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'lost'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'text-rose-700 hover:bg-rose-50'
          }`}
        >
          <BookmarkX className="w-3.5 h-3.5" />
          Lost & Damaged Books Register ({lostBooks.length})
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
          Stationery Supplies ({stationery.length})
        </button>
      </div>

      {/* =========================================================================
          TAB 1: AVAILABLE BOOKS CATALOG & STOCK TABLE
          ========================================================================= */}
      {activeTab === 'catalog' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search title, subject, publisher or shelf..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-800 font-medium"
              >
                <option value="All">All Grades</option>
                <option value="Grade 7">Grade 7</option>
                <option value="Grade 8">Grade 8</option>
                <option value="Grade 9">Grade 9</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Textbook Title & Subject</th>
                  <th className="px-4 py-3">Publisher & Grade</th>
                  <th className="px-4 py-3">Shelf Location</th>
                  <th className="px-4 py-3 text-right">Total Copies</th>
                  <th className="px-4 py-3 text-right">Available on Shelf</th>
                  <th className="px-4 py-3 text-right">On Loan</th>
                  <th className="px-4 py-3 text-right">Lost</th>
                  <th className="px-4 py-3 text-right">Unit Value (KES)</th>
                  <th className="px-4 py-3 text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCatalog.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-400">
                      No textbook titles found matching search.
                    </td>
                  </tr>
                ) : (
                  filteredCatalog.map((book) => (
                    <tr key={book.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{book.title}</div>
                        <span className="text-[11px] text-slate-500 font-mono">{book.subjectCode}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <div>{book.publisher}</div>
                        <span className="text-[11px] text-slate-500 font-medium">{book.gradeLevel}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {book.shelfLocation}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900 tabular-nums">
                        {book.totalCopies}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-800 tabular-nums">
                        <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded">
                          {book.availableCopies} Copies
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sky-700 font-semibold tabular-nums">
                        {book.onLoanCopies}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-rose-700">
                        {book.lostCopies > 0 ? `${book.lostCopies} lost` : '0'}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600 font-medium tabular-nums">
                        KES {book.unitValueKes.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => {
                              setCatalogBooks((prev) =>
                                prev.map((b) =>
                                  b.id === book.id
                                    ? {
                                        ...b,
                                        totalCopies: b.totalCopies + 10,
                                        availableCopies: b.availableCopies + 10,
                                      }
                                    : b
                                )
                              );
                              setToastMessage(`Restocked +10 copies of ${book.title}.`);
                              setTimeout(() => setToastMessage(null), 3000);
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[11px]"
                            title="Add 10 copies"
                          >
                            +10
                          </button>
                        </div>
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
          TAB 2: ACTIVE LEARNER TEXTBOOK LOANS
          ========================================================================= */}
      {activeTab === 'loans' && (
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
                className="bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-800 font-medium"
              >
                <option value="All">All Grades</option>
                <option value="Grade 7">Grade 7</option>
                <option value="Grade 8">Grade 8</option>
                <option value="Grade 9">Grade 9</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-800 font-medium"
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
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedLoanForReturn(loan);
                                setIsReturnModalOpen(true);
                              }}
                              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-2.5 py-1 rounded transition-colors"
                            >
                              Return Book
                            </button>
                            <button
                              onClick={() => {
                                setLostBookForm({
                                  bookBarcode: loan.bookBarcode,
                                  bookTitle: loan.bookTitle,
                                  subjectCode: loan.subjectCode,
                                  gradeLevel: loan.gradeLevel,
                                  studentName: loan.studentName,
                                  nemisUpi: loan.nemisUpi,
                                  stream: loan.stream,
                                  replacementCostKes: 680,
                                  notes: `Reported lost by learner ${loan.studentName} during active loan.`,
                                });
                                setIsReportLostModalOpen(true);
                              }}
                              className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold px-2 py-1 rounded transition-colors border border-rose-200"
                            >
                              Lost
                            </button>
                          </div>
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
          TAB 3: LOST & DAMAGED BOOKS REGISTER (DEDICATED SYSTEM TABULATION)
          ========================================================================= */}
      {activeTab === 'lost' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-rose-50 border-b border-rose-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div>
              <h3 className="font-bold text-rose-950 flex items-center gap-1.5">
                <BookmarkX className="w-4 h-4 text-rose-700" />
                Lost & Damaged Books Register (System Tabulation)
              </h3>
              <p className="text-[11px] text-rose-800 mt-0.5">
                Every lost textbook is tabulated with learner NEMIS UPI, replacement levy, and clearance receipts.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-white text-rose-900 border border-rose-200 px-3 py-1 rounded font-bold">
                Total Unrecovered: KES {lostBooks.filter((l) => l.paymentStatus === 'Pending Settlement').reduce((s, l) => s + l.replacementCostKes, 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Book Barcode & Title</th>
                  <th className="px-4 py-3">Learner & NEMIS UPI</th>
                  <th className="px-4 py-3">Stream</th>
                  <th className="px-4 py-3">Date Reported Lost</th>
                  <th className="px-4 py-3 text-right">Replacement Cost</th>
                  <th className="px-4 py-3 text-center">Settlement Status</th>
                  <th className="px-4 py-3">Receipt / Notes</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLostBooks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400">
                      No lost textbooks recorded in the register.
                    </td>
                  </tr>
                ) : (
                  filteredLostBooks.map((lost) => (
                    <tr key={lost.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{lost.bookTitle}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{lost.bookBarcode}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{lost.studentName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{lost.nemisUpi}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{lost.stream}</td>
                      <td className="px-4 py-3 text-slate-600 font-mono">{lost.dateReportedLost}</td>
                      <td className="px-4 py-3 text-right font-bold text-rose-800 tabular-nums">
                        KES {lost.replacementCostKes.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            lost.paymentStatus === 'Cleared by Parent'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : lost.paymentStatus === 'Waived by Headteacher'
                              ? 'bg-slate-100 text-slate-700 border border-slate-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {lost.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={lost.notes || lost.receiptRef}>
                        {lost.receiptRef ? <span className="font-mono text-emerald-800 font-bold">{lost.receiptRef} </span> : null}
                        {lost.notes || 'Awaiting replacement payment.'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {lost.paymentStatus === 'Pending Settlement' ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => {
                                const receipt = `RCT-BNK-${Math.floor(1000 + Math.random() * 9000)}`;
                                setLostBooks((prev) =>
                                  prev.map((l) =>
                                    l.id === lost.id
                                      ? {
                                          ...l,
                                          paymentStatus: 'Cleared by Parent',
                                          receiptRef: receipt,
                                          notes: 'Paid via bank deposit / M-Pesa.',
                                        }
                                      : l
                                  )
                                );
                                setToastMessage(`Marked replacement fee for ${lost.bookTitle} as CLEARED (${receipt}).`);
                                setTimeout(() => setToastMessage(null), 3500);
                              }}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded font-semibold text-[11px]"
                            >
                              Settle Fee
                            </button>
                            <button
                              onClick={() => {
                                setLostBooks((prev) =>
                                  prev.map((l) =>
                                    l.id === lost.id
                                      ? { ...l, paymentStatus: 'Waived by Headteacher', notes: 'Waived on hardship grounds.' }
                                      : l
                                  )
                                );
                                setToastMessage(`Waived penalty for ${lost.studentName}.`);
                                setTimeout(() => setToastMessage(null), 3000);
                              }}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded font-semibold text-[11px]"
                            >
                              Waive
                            </button>
                          </div>
                        ) : (
                          <span className="text-emerald-700 text-[11px] font-semibold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                          </span>
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
          TAB 4: STATIONERY & SUPPLIES INVENTORY TABLE
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
                              setToastMessage(`Restocked +20 units of ${item.name}.`);
                              setTimeout(() => setToastMessage(null), 3000);
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
                              setToastMessage(`Dispensed 5 units of ${item.name} to class.`);
                              setTimeout(() => setToastMessage(null), 3000);
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

      {/* =========================================================================
          MODAL: ADD AVAILABLE BOOKS
          ========================================================================= */}
      {isAddBookModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">Add Available Books to Store</h3>
              </div>
              <button
                onClick={() => setIsAddBookModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAvailableBook} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Textbook Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mentor Junior Secondary Kiswahili Grade 8"
                  value={newBookForm.title}
                  onChange={(e) => setNewBookForm({ ...newBookForm, title: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Subject Code:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KIS-JSS, MAT-JSS"
                    value={newBookForm.subjectCode}
                    onChange={(e) => setNewBookForm({ ...newBookForm, subjectCode: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono text-slate-900 uppercase"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Grade Level:</label>
                  <select
                    value={newBookForm.gradeLevel}
                    onChange={(e) =>
                      setNewBookForm({ ...newBookForm, gradeLevel: e.target.value as AvailableBookCatalogItem['gradeLevel'] })
                    }
                    className="w-full border border-slate-300 rounded px-2.5 py-2 text-xs text-slate-800"
                  >
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Publisher:</label>
                  <select
                    value={newBookForm.publisher}
                    onChange={(e) =>
                      setNewBookForm({ ...newBookForm, publisher: e.target.value as AvailableBookCatalogItem['publisher'] })
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
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Copies Available (Stock):</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newBookForm.totalCopies}
                    onChange={(e) => setNewBookForm({ ...newBookForm, totalCopies: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-bold tabular-nums text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Unit Replacement Value (KES):</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={newBookForm.unitValueKes}
                    onChange={(e) => setNewBookForm({ ...newBookForm, unitValueKes: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-bold tabular-nums text-emerald-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Shelf / Cupboard Location:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cabinet B-3, Stack 2"
                    value={newBookForm.shelfLocation}
                    onChange={(e) => setNewBookForm({ ...newBookForm, shelfLocation: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddBookModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white rounded text-xs font-semibold hover:bg-emerald-800"
                >
                  Save to Available Books Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD STATIONERY BOUGHT
          ========================================================================= */}
      {isAddStationeryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">Add Stationery Bought (Procurement)</h3>
              </div>
              <button
                onClick={() => setIsAddStationeryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStationeryBought} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Item Description / Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. A4 Graph Books 120 Pgs, Pelikan White Chalk"
                  value={newStationeryForm.name}
                  onChange={(e) => setNewStationeryForm({ ...newStationeryForm, name: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category:</label>
                  <select
                    value={newStationeryForm.category}
                    onChange={(e) =>
                      setNewStationeryForm({
                        ...newStationeryForm,
                        category: e.target.value as StationeryItem['category'],
                      })
                    }
                    className="w-full border border-slate-300 rounded px-2.5 py-2 text-xs text-slate-800"
                  >
                    <option value="Exercise & Graph Books">Exercise & Graph Books</option>
                    <option value="Writing Instruments">Writing Instruments</option>
                    <option value="Classroom Chalk & Markers">Classroom Chalk & Markers</option>
                    <option value="Maths & Science Kits">Maths & Science Kits</option>
                    <option value="Art & Craft Materials">Art & Craft Materials</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Unit of Measure:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pieces, Boxes, Dozen Packs"
                    value={newStationeryForm.unit}
                    onChange={(e) => setNewStationeryForm({ ...newStationeryForm, unit: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Quantity Bought:</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newStationeryForm.stockOnHand}
                    onChange={(e) => setNewStationeryForm({ ...newStationeryForm, stockOnHand: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-bold tabular-nums text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Unit Cost (KES):</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newStationeryForm.unitCostKes}
                    onChange={(e) => setNewStationeryForm({ ...newStationeryForm, unitCostKes: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-bold tabular-nums text-slate-900"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between">
                <span className="text-xs text-emerald-800 font-semibold">Total Expenditure Added:</span>
                <span className="text-base font-bold text-emerald-950 tabular-nums">
                  KES {(newStationeryForm.stockOnHand * newStationeryForm.unitCostKes).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Allocated Department:</label>
                  <input
                    type="text"
                    required
                    value={newStationeryForm.allocatedDepartment}
                    onChange={(e) => setNewStationeryForm({ ...newStationeryForm, allocatedDepartment: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Supplier / Merchant:</label>
                  <input
                    type="text"
                    value={newStationeryForm.supplier}
                    onChange={(e) => setNewStationeryForm({ ...newStationeryForm, supplier: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddStationeryModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white rounded text-xs font-semibold hover:bg-emerald-800"
                >
                  Record Stationery Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: REPORT LOST BOOK (TABULATED IN SYSTEM)
          ========================================================================= */}
      {isReportLostModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <BookmarkX className="w-5 h-5 text-rose-700" />
                <h3 className="text-base font-bold text-slate-900">Tabulate Lost Textbook</h3>
              </div>
              <button
                onClick={() => setIsReportLostModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportLostBook} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Lost Textbook:</label>
                <select
                  value={lostBookForm.bookTitle}
                  onChange={(e) => {
                    const found = catalogBooks.find((b) => b.title === e.target.value);
                    setLostBookForm({
                      ...lostBookForm,
                      bookTitle: e.target.value,
                      subjectCode: found?.subjectCode || lostBookForm.subjectCode,
                      gradeLevel: found?.gradeLevel || lostBookForm.gradeLevel,
                      replacementCostKes: found?.unitValueKes || lostBookForm.replacementCostKes,
                    });
                  }}
                  className="w-full border border-slate-300 rounded px-2.5 py-2 text-xs text-slate-900 font-medium"
                >
                  {catalogBooks.map((b) => (
                    <option key={b.id} value={b.title}>
                      {b.title} ({b.gradeLevel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Barcode / Serial #:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KLB-G8-ENG-0319"
                    value={lostBookForm.bookBarcode}
                    onChange={(e) => setLostBookForm({ ...lostBookForm, bookBarcode: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Replacement Fee (KES):</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={lostBookForm.replacementCostKes}
                    onChange={(e) => setLostBookForm({ ...lostBookForm, replacementCostKes: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-bold tabular-nums text-rose-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Learner Name:</label>
                  <input
                    type="text"
                    required
                    value={lostBookForm.studentName}
                    onChange={(e) => setLostBookForm({ ...lostBookForm, studentName: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">NEMIS UPI:</label>
                  <input
                    type="text"
                    required
                    value={lostBookForm.nemisUpi}
                    onChange={(e) => setLostBookForm({ ...lostBookForm, nemisUpi: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Stream / Class:</label>
                <input
                  type="text"
                  required
                  value={lostBookForm.stream}
                  onChange={(e) => setLostBookForm({ ...lostBookForm, stream: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Loss Incident Notes:</label>
                <textarea
                  rows={2}
                  value={lostBookForm.notes}
                  onChange={(e) => setLostBookForm({ ...lostBookForm, notes: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReportLostModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-700 text-white rounded text-xs font-semibold hover:bg-rose-800"
                >
                  Tabulate in Lost Books Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
