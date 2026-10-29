/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  FileText,
  X,
  RefreshCw,
  Search,
  Check,
  Building,
  CreditCard,
  AlertCircle,
  Copy,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { exportToExcel } from '../utils/excelExport';
import { uploadFileWithProgress } from '../services/storageService';
import { useAuth } from '../context/AuthContext';

export interface StudentFeeRef {
  id: string;
  name: string;
  admissionNo?: string;
  nemisUpi: string;
  grade: string;
  stream: string;
  fees: {
    totalTermFee: number;
    paidAmount: number;
    balance: number;
    status: 'Cleared' | 'Partial' | 'Defaulter';
  };
}

export interface ParsedFeeRow {
  rowNum: number;
  rawName: string;
  rawIdentifier?: string;
  rawAmount: number;
  matchedStudent?: StudentFeeRef;
  status: 'Matched' | 'Not Found' | 'Invalid Amount' | 'Duplicate Entry';
  newBalance?: number;
  duplicateNotice?: string;
}

export interface ProcessedBatchSummary {
  batchId: string;
  date: string;
  totalCollected: number;
  rowsCount: number;
  items: {
    studentName: string;
    nemisUpi: string;
    stream: string;
    amountPaid: number;
    previousBalance: number;
    newBalance: number;
    receiptNumber: string;
  }[];
}

interface Props {
  students: StudentFeeRef[];
  onApplyBatchPayments: (
    updates: { studentId: string; amountPaid: number; receiptNumber: string }[]
  ) => void;
  onClose: () => void;
}

export function ExcelFeeBatchManager({ students, onApplyBatchPayments, onClose }: Props) {
  const { currentUser } = useAuth();
  const [parsedRows, setParsedRows] = useState<ParsedFeeRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedBatch, setCompletedBatch] = useState<ProcessedBatchSummary | null>(null);

  // 1. Download Blank/Pre-populated Template with requested columns: Name, Fees Paid
  const handleDownloadTemplate = (prepopulate: boolean) => {
    if (prepopulate) {
      exportToExcel(
        'Limuru_Model_Fee_Payment_Template',
        students,
        [
          { header: 'Admission No', key: (s) => s.admissionNo || '' },
          { header: 'Name', key: 'name' },
          { header: 'Fees Paid', key: () => 0 },
          { header: 'NEMIS UPI', key: 'nemisUpi' },
          { header: 'Stream', key: 'stream' },
          { header: 'Current Balance (KES)', key: (s) => s.fees.balance },
        ]
      );
    } else {
      const sampleData = [
        { admissionNo: 'LMS/2026/0101', name: 'Brian Omondi Odhiambo', feesPaid: 15000 },
        { admissionNo: 'LMS/2026/0102', name: 'Faith Wangari Mburu', feesPaid: 8500 },
        { admissionNo: 'LMS/2026/0103', name: 'Kevin Kiprono Cheruiyot', feesPaid: 12000 },
        { admissionNo: 'LMS/2026/0104', name: 'Denis Wafula Simiyu', feesPaid: 20000 },
      ];
      exportToExcel(
        'Fee_Upload_Template_Name_FeesPaid',
        sampleData,
        [
          { header: 'Admission No', key: 'admissionNo' },
          { header: 'Name', key: 'name' },
          { header: 'Fees Paid', key: 'feesPaid' },
        ]
      );
    }
  };

  // 2. Parse Uploaded Spreadsheet (.xlsx, .xls, .csv) with persistence & duplicate check
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMessage(null);
    setIsProcessing(true);
    setUploadProgress(10);

    try {
      // Persist the batch spreadsheet in Firebase Storage / persistent storage
      const uploader = currentUser
        ? { uid: currentUser.uid, fullName: currentUser.fullName, role: currentUser.role }
        : { uid: 'bursar_sys', fullName: 'School Bursar', role: 'accountant' };

      await uploadFileWithProgress({
        file,
        category: 'fee_import_sheet',
        linkedRecordId: 'fee_batch_' + Date.now(),
        linkedRecordType: 'fee_import_sheet',
        user: uploader,
        notes: `Fee Import Batch Sheet: ${file.name}`,
        expectedType: 'spreadsheet',
        onProgress: (p) => setUploadProgress(p),
      });

      // Parse with xlsx
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(firstSheet, { defval: '' });

      if (rawRows.length === 0) {
        setErrorMessage('The uploaded spreadsheet is empty or has no readable rows.');
        setIsProcessing(false);
        return;
      }

      const results: ParsedFeeRow[] = [];
      const seenIdentifiers = new Map<string, number>(); // Identifier -> row number for duplicate detection

      rawRows.forEach((row, idx) => {
        const rowNum = idx + 2;
        const rawName = (row['Name'] || row['name'] || row['Student Name'] || row['Learner Name'] || '').toString().trim();
        const rawAdm = (row['Admission No'] || row['AdmNo'] || row['AdmissionNo'] || row['Adm No'] || '').toString().trim();
        const rawUpi = (row['NEMIS UPI'] || row['UPI'] || row['NEMIS'] || '').toString().trim();
        const rawAmountVal = row['Fees Paid'] || row['Fee Paid'] || row['Amount'] || row['amount'] || row['Fees'];
        const rawAmount = parseFloat(String(rawAmountVal).replace(/[^0-9.]/g, ''));

        if (!rawName && !rawAdm && !rawUpi) return;

        // Match student by Admission No, NEMIS UPI, or Name
        const matched = students.find((s) => {
          if (rawAdm && s.admissionNo && s.admissionNo.toLowerCase() === rawAdm.toLowerCase()) return true;
          if (rawUpi && s.nemisUpi && s.nemisUpi.toLowerCase() === rawUpi.toLowerCase()) return true;
          if (rawName) {
            const sName = s.name.toLowerCase();
            const rName = rawName.toLowerCase();
            return sName === rName || sName.includes(rName) || rName.includes(sName);
          }
          return false;
        });

        // Duplicate detection: check if student appeared previously in the same spreadsheet
        let isDuplicate = false;
        let duplicateNotice = '';
        const matchKey = matched ? matched.id : rawAdm || rawName;

        if (seenIdentifiers.has(matchKey)) {
          isDuplicate = true;
          duplicateNotice = `Duplicate entry: previously matched on row ${seenIdentifiers.get(matchKey)}`;
        } else {
          seenIdentifiers.set(matchKey, rowNum);
        }

        let status: ParsedFeeRow['status'] = 'Matched';
        if (isDuplicate) {
          status = 'Duplicate Entry';
        } else if (isNaN(rawAmount) || rawAmount <= 0) {
          status = 'Invalid Amount';
        } else if (!matched) {
          status = 'Not Found';
        }

        const newBal = matched && !isNaN(rawAmount) ? Math.max(0, matched.fees.balance - rawAmount) : undefined;

        results.push({
          rowNum,
          rawName: rawName || matched?.name || 'Unknown',
          rawIdentifier: rawAdm || rawUpi || matched?.admissionNo,
          rawAmount: isNaN(rawAmount) ? 0 : rawAmount,
          matchedStudent: matched,
          status,
          newBalance: newBal,
          duplicateNotice,
        });
      });

      setParsedRows(results);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to read spreadsheet.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Confirm & Apply Batch Payments
  const handleProcessBatch = () => {
    const validRows = parsedRows.filter((r) => r.status === 'Matched' && r.matchedStudent && r.rawAmount > 0);
    if (validRows.length === 0) {
      alert('No valid fee rows matched to enrolled learners to process.');
      return;
    }

    setIsProcessing(true);

    const batchReceipts: ProcessedBatchSummary['items'] = [];
    const updates: { studentId: string; amountPaid: number; receiptNumber: string }[] = [];
    const dateStr = new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    validRows.forEach((row) => {
      const student = row.matchedStudent!;
      const receiptNum = `LMS/EXL/${new Date().getFullYear()}/${Math.floor(10000 + Math.random() * 90000)}`;

      updates.push({
        studentId: student.id,
        amountPaid: row.rawAmount,
        receiptNumber: receiptNum,
      });

      batchReceipts.push({
        studentName: student.name,
        nemisUpi: student.nemisUpi,
        stream: student.stream,
        amountPaid: row.rawAmount,
        previousBalance: student.fees.balance,
        newBalance: Math.max(0, student.fees.balance - row.rawAmount),
        receiptNumber: receiptNum,
      });
    });

    onApplyBatchPayments(updates);

    const summary: ProcessedBatchSummary = {
      batchId: `BATCH-EXL-${Date.now().toString().slice(-6)}`,
      date: dateStr,
      totalCollected: batchReceipts.reduce((sum, item) => sum + item.amountPaid, 0),
      rowsCount: batchReceipts.length,
      items: batchReceipts,
    };

    setCompletedBatch(summary);
    setIsProcessing(false);
  };

  // 4. Export Batch Reconciliation to Excel
  const handleExportReconciliationExcel = () => {
    if (!completedBatch) return;
    exportToExcel(
      `Limuru_Model_Fee_Reconciliation_${completedBatch.batchId}`,
      completedBatch.items,
      [
        { header: 'Receipt No', key: 'receiptNumber' },
        { header: 'Student Name', key: 'studentName' },
        { header: 'NEMIS UPI', key: 'nemisUpi' },
        { header: 'Stream', key: 'stream' },
        { header: 'Amount Paid (KES)', key: 'amountPaid' },
        { header: 'Previous Balance (KES)', key: 'previousBalance' },
        { header: 'New Balance (KES)', key: 'newBalance' },
      ]
    );
  };

  const matchedCount = parsedRows.filter((r) => r.status === 'Matched').length;
  const duplicateCount = parsedRows.filter((r) => r.status === 'Duplicate Entry').length;
  const notFoundCount = parsedRows.filter((r) => r.status === 'Not Found').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 text-slate-800 animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Bulk Fee Ledger Import & Reconciliation (Excel / CSV)
              </h3>
              <p className="text-xs text-slate-500">
                Limuru Model Comprehensive School &bull; Duplicate detection &bull; Persistent file audit
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

        {!completedBatch ? (
          <div className="mt-4 space-y-4 text-xs">
            {/* Template Download Section */}
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-emerald-700" />
                  Download Verified Fee Template
                </h4>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Pre-populated with enrolled students or blank minimal template (Name, Fees Paid, Admission No).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate(false)}
                  className="px-3 py-1.5 bg-white border border-emerald-600 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-bold shadow-xs"
                >
                  Blank Template (.csv)
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate(true)}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs"
                >
                  Current Student List (.xlsx)
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Upload Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <label className="font-bold text-slate-800 block text-xs">
                Upload Fee Spreadsheet (.xlsx, .xls, .csv):
              </label>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="cursor-pointer px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs inline-flex items-center gap-2 shadow-xs transition-colors shrink-0">
                  <Upload className="w-4 h-4" />
                  {isProcessing ? 'Processing & Persisting...' : 'Select Fee File'}
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    disabled={isProcessing}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {fileName && (
                  <div className="flex items-center gap-2 text-slate-700 font-mono text-[11px]">
                    <span className="font-semibold">{fileName}</span>
                    <span>&bull;</span>
                    <span className="text-emerald-700 font-bold">{parsedRows.length} rows parsed</span>
                  </div>
                )}
              </div>

              {isProcessing && (
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mt-2">
                  <div
                    className="bg-emerald-600 h-2 transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Parsed Rows Preview with Duplicate Badges */}
            {parsedRows.length > 0 && (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="p-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">Preview: {parsedRows.length} Rows</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[11px]">
                      {matchedCount} Valid Matched
                    </span>
                    {duplicateCount > 0 && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-semibold text-[11px] flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-700" /> {duplicateCount} Duplicates
                      </span>
                    )}
                    {notFoundCount > 0 && (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-semibold text-[11px]">
                        {notFoundCount} Unmatched
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleProcessBatch}
                    disabled={matchedCount === 0 || isProcessing}
                    className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Confirm & Credit {matchedCount} Accounts
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-200/70 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="p-2">Line</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Uploaded Name</th>
                        <th className="p-2">Matched Learner</th>
                        <th className="p-2 text-right">Fee Paid (KES)</th>
                        <th className="p-2 text-right">New Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedRows.map((row, idx) => (
                        <tr
                          key={idx}
                          className={
                            row.status === 'Matched'
                              ? 'hover:bg-emerald-50/40'
                              : row.status === 'Duplicate Entry'
                              ? 'bg-amber-50/60'
                              : 'bg-rose-50/50'
                          }
                        >
                          <td className="p-2 font-mono text-slate-500">{row.rowNum}</td>
                          <td className="p-2">
                            {row.status === 'Matched' ? (
                              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                                Matched
                              </span>
                            ) : row.status === 'Duplicate Entry' ? (
                              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded text-[10px] font-bold" title={row.duplicateNotice}>
                                Duplicate
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded text-[10px] font-bold">
                                {row.status}
                              </span>
                            )}
                          </td>
                          <td className="p-2 font-medium text-slate-900">{row.rawName}</td>
                          <td className="p-2 text-slate-700">
                            {row.matchedStudent ? (
                              <span>
                                {row.matchedStudent.name} ({row.matchedStudent.stream})
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">No match found</span>
                            )}
                          </td>
                          <td className="p-2 text-right font-bold text-emerald-800">
                            KES {row.rawAmount.toLocaleString()}
                          </td>
                          <td className="p-2 text-right font-mono text-slate-700">
                            {row.newBalance !== undefined ? `KES ${row.newBalance.toLocaleString()}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Completed Batch Reconciliation Summary */
          <div className="mt-4 space-y-4 text-xs">
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Batch Successfully Processed & Audited</h4>
                  <p className="text-[11px] text-emerald-800 font-mono">
                    Batch ID: {completedBatch.batchId} &bull; Total: KES {completedBatch.totalCollected.toLocaleString()} credited across {completedBatch.rowsCount} learners
                  </p>
                </div>
              </div>
              <button
                onClick={handleExportReconciliationExcel}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" /> Export Reconciliation (.xlsx)
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2">Receipt No</th>
                    <th className="p-2">Learner</th>
                    <th className="p-2">UPI</th>
                    <th className="p-2 text-right">Amount Paid</th>
                    <th className="p-2 text-right">New Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {completedBatch.items.map((it, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2 font-mono font-bold text-slate-900">{it.receiptNumber}</td>
                      <td className="p-2 text-slate-900">{it.studentName}</td>
                      <td className="p-2 font-mono text-slate-600">{it.nemisUpi}</td>
                      <td className="p-2 text-right font-bold text-emerald-800">KES {it.amountPaid.toLocaleString()}</td>
                      <td className="p-2 text-right font-mono text-slate-700">KES {it.newBalance.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={onClose}
                className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-lg text-xs shadow-xs"
              >
                Close & Return to Fee Ledger
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
