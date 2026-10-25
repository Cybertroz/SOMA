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
} from 'lucide-react';
import { exportToExcel } from '../utils/excelExport';

export interface StudentFeeRef {
  id: string;
  name: string;
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
  rawName: string;
  rawAmount: number;
  matchedStudent?: StudentFeeRef;
  status: 'Matched' | 'Not Found' | 'Invalid Amount';
  newBalance?: number;
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
  const [parsedRows, setParsedRows] = useState<ParsedFeeRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedBatch, setCompletedBatch] = useState<ProcessedBatchSummary | null>(null);

  // 1. Download Blank/Pre-populated Template with requested columns: Name, Fees Paid
  const handleDownloadTemplate = (prepopulate: boolean) => {
    if (prepopulate) {
      exportToExcel(
        'Zawadi_JSS_Fee_Payment_Template',
        students,
        [
          { header: 'Name', key: 'name' },
          { header: 'Fees Paid', key: () => 0 },
          { header: 'NEMIS UPI', key: 'nemisUpi' },
          { header: 'Stream', key: 'stream' },
          { header: 'Current Balance (KES)', key: (s) => s.fees.balance },
        ]
      );
    } else {
      // Clean minimal template strictly: Name, Fees Paid
      const sampleData = [
        { name: 'Brian Omondi Odhiambo', feesPaid: 15000 },
        { name: 'Wanjiku Faith Mwangi', feesPaid: 8500 },
        { name: 'Kevin Kiprono Cheruiyot', feesPaid: 12000 },
        { name: 'Denis Wafula Simiyu', feesPaid: 20000 },
      ];
      exportToExcel(
        'Fee_Upload_Template_Name_FeesPaid',
        sampleData,
        [
          { header: 'Name', key: 'name' },
          { header: 'Fees Paid', key: 'feesPaid' },
        ]
      );
    }
  };

  // 2. Parse Uploaded CSV / Excel text
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
      if (lines.length <= 1) {
        alert('The uploaded file is empty or missing data rows.');
        return;
      }

      // Detect header index
      const headerCols = lines[0].split(/[,;\t]/).map((c) => c.replace(/^["']|["']$/g, '').trim().toLowerCase());
      let nameIndex = headerCols.findIndex((c) => c.includes('name'));
      let feeIndex = headerCols.findIndex((c) => c.includes('fee') || c.includes('paid') || c.includes('amount'));

      if (nameIndex === -1) nameIndex = 0;
      if (feeIndex === -1) feeIndex = 1;

      const results: ParsedFeeRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        const rawLine = lines[i];
        // Handle CSV quoted strings
        const parts = rawLine.match(/(".*?"|[^",;\t]+)(?=\s*[,;\t]|\s*$)/g) || rawLine.split(/[,;\t]/);
        if (!parts || parts.length === 0) continue;

        const rawName = (parts[nameIndex] || '').replace(/^["']|["']$/g, '').trim();
        const rawAmountStr = (parts[feeIndex] || '').replace(/^["']|["']$/g, '').replace(/[^0-9.]/g, '');
        const rawAmount = parseFloat(rawAmountStr);

        if (!rawName) continue;

        // Match student by name (case-insensitive substring or exact)
        const matched = students.find(
          (s) =>
            s.name.toLowerCase() === rawName.toLowerCase() ||
            s.name.toLowerCase().includes(rawName.toLowerCase()) ||
            rawName.toLowerCase().includes(s.name.toLowerCase())
        );

        let status: ParsedFeeRow['status'] = 'Matched';
        if (isNaN(rawAmount) || rawAmount <= 0) {
          status = 'Invalid Amount';
        } else if (!matched) {
          status = 'Not Found';
        }

        const newBal = matched && !isNaN(rawAmount) ? Math.max(0, matched.fees.balance - rawAmount) : undefined;

        results.push({
          rawName,
          rawAmount: isNaN(rawAmount) ? 0 : rawAmount,
          matchedStudent: matched,
          status,
          newBalance: newBal,
        });
      }

      setParsedRows(results);
    };

    reader.readAsText(file);
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

    validRows.forEach((row, idx) => {
      const student = row.matchedStudent!;
      const receiptNum = `ZWD/EXL/${new Date().getFullYear()}/${Math.floor(10000 + Math.random() * 90000)}`;

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
      `Zawadi_JSS_Fee_Reconciliation_${completedBatch.batchId}`,
      completedBatch.items,
      [
        { header: 'Receipt No', key: 'receiptNumber' },
        { header: 'Student Name', key: 'studentName' },
        { header: 'NEMIS UPI', key: 'nemisUpi' },
        { header: 'Stream', key: 'stream' },
        { header: 'Amount Paid (KES)', key: 'amountPaid' },
        { header: 'Previous Balance (KES)', key: 'previousBalance' },
        { header: 'New Balance (KES)', key: 'newBalance' },
        {
          header: 'Status After Payment',
          key: (item) => (item.newBalance === 0 ? 'CLEARED' : 'PARTIAL BALANCE'),
        },
      ]
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 sm:p-8 border border-slate-200 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Excel Bulk Fee Payment Importer & Reconciliation
              </h3>
              <p className="text-xs text-slate-500">
                Upload fee sheets with columns: <strong>Name</strong>, <strong>Fees Paid</strong>. Generates instant PDF & Excel statements.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* STEP 1 & 2 CONTROLS: DOWNLOAD TEMPLATE & UPLOAD */}
        {!completedBatch ? (
          <div className="mt-6 space-y-6">
            {/* Top Cards: Template & Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Template Download Card */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <Download className="w-4 h-4 text-emerald-700" />
                  <span>1. Download Excel Template</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Get a clean template with the requested columns (<strong>Name</strong>, <strong>Fees Paid</strong>) ready for data entry.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => handleDownloadTemplate(false)}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                    Download Blank Template (.csv)
                  </button>
                  <button
                    onClick={() => handleDownloadTemplate(true)}
                    className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-700" />
                    Pre-populated with Enrolled Learners
                  </button>
                </div>
              </div>

              {/* Upload File Card */}
              <div className="p-5 bg-emerald-50/50 border border-emerald-200 rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <Upload className="w-4 h-4 text-emerald-700" />
                  <span>2. Upload Completed Excel / CSV</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Select your completed spreadsheet. The system will auto-match learners and verify balances.
                </p>
                <div>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded shadow-xs transition-colors">
                    <Upload className="w-4 h-4" />
                    {fileName ? `Loaded: ${fileName}` : 'Choose Excel / CSV File'}
                    <input
                      type="file"
                      accept=".csv, .xlsx, .xls, .txt, .tsv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {fileName && (
                    <span className="text-xs text-slate-500 ml-2 font-mono">{parsedRows.length} rows read</span>
                  )}
                </div>
              </div>
            </div>

            {/* PREVIEW OF PARSED ROWS */}
            {parsedRows.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <div className="font-semibold text-slate-800">
                    Previewing {parsedRows.length} payment rows (
                    <span className="text-emerald-700 font-bold">
                      {parsedRows.filter((r) => r.status === 'Matched').length} Matched
                    </span>
                    {parsedRows.some((r) => r.status !== 'Matched') && (
                      <span className="text-rose-600 font-bold ml-1.5">
                        · {parsedRows.filter((r) => r.status !== 'Matched').length} Need Attention
                      </span>
                    )}
                    )
                  </div>
                  <span className="text-slate-500">
                    Total Amount to Credit:{' '}
                    <strong className="text-emerald-800 tabular-nums">
                      KES{' '}
                      {parsedRows
                        .filter((r) => r.status === 'Matched')
                        .reduce((sum, r) => sum + r.rawAmount, 0)
                        .toLocaleString()}
                    </strong>
                  </span>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-64">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0">
                      <tr>
                        <th className="p-2.5">Name in Excel</th>
                        <th className="p-2.5">Fees Paid (KES)</th>
                        <th className="p-2.5">Matched Enrolled Learner</th>
                        <th className="p-2.5 text-right">Current Bal</th>
                        <th className="p-2.5 text-right">New Bal</th>
                        <th className="p-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-medium text-slate-900">{row.rawName}</td>
                          <td className="p-2.5 font-bold text-emerald-700 tabular-nums">
                            KES {row.rawAmount.toLocaleString()}
                          </td>
                          <td className="p-2.5 text-slate-700">
                            {row.matchedStudent ? (
                              <div>
                                <span className="font-medium text-slate-900">{row.matchedStudent.name}</span>
                                <span className="text-[11px] text-slate-500 block font-mono">
                                  {row.matchedStudent.stream} · {row.matchedStudent.nemisUpi}
                                </span>
                              </div>
                            ) : (
                              <span className="text-rose-600 italic">No matching student found</span>
                            )}
                          </td>
                          <td className="p-2.5 text-right text-slate-600 tabular-nums">
                            {row.matchedStudent ? `KES ${row.matchedStudent.fees.balance.toLocaleString()}` : '-'}
                          </td>
                          <td className="p-2.5 text-right font-bold text-slate-900 tabular-nums">
                            {row.newBalance !== undefined ? `KES ${row.newBalance.toLocaleString()}` : '-'}
                          </td>
                          <td className="p-2.5 text-center">
                            {row.status === 'Matched' ? (
                              <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[11px] font-semibold">
                                Matched
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[11px] font-semibold">
                                {row.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Process Button */}
                <div className="pt-2 flex justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProcessBatch}
                    disabled={isProcessing || parsedRows.filter((r) => r.status === 'Matched').length === 0}
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isProcessing ? 'Processing Batch...' : 'Confirm & Apply Bulk Fees'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* =========================================================================
             STEP 3: COMPLETED BATCH WITH DOWNLOADABLE PDF & EXCEL OPTIONS
             ========================================================================= */
          <div className="mt-6 space-y-6">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  <span>Bulk Fee Payments Applied Successfully!</span>
                </div>
                <p className="text-xs text-emerald-900 mt-0.5">
                  Batch <strong>{completedBatch.batchId}</strong> · {completedBatch.rowsCount} student accounts credited · Total KES {completedBatch.totalCollected.toLocaleString()}
                </p>
              </div>

              {/* Action Buttons: Download PDF and Excel */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportReconciliationExcel}
                  className="px-3.5 py-2 bg-white border border-emerald-600 text-emerald-800 hover:bg-emerald-50 rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  Download Excel (.csv)
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print / Save PDF Statement
                </button>
              </div>
            </div>

            {/* Official Printable / Downloadable PDF Reconciliation Statement */}
            <div className="print-card border border-slate-300 rounded-lg p-6 sm:p-8 bg-white space-y-5">
              <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                <div className="text-xs uppercase tracking-widest text-slate-600 font-bold">
                  Republic of Kenya · Ministry of Education
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                  Zawadi Junior Secondary School
                </h2>
                <div className="text-xs text-slate-600">
                  MoE Center: <strong>20401823</strong> · Finance & Bursary Department
                </div>
                <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider pt-2">
                  Official Bulk Fee Payment Reconciliation & Receipt Certificate
                </div>
                <div className="text-xs text-slate-500">
                  Batch ID: <strong className="font-mono text-slate-800">{completedBatch.batchId}</strong> · Processed: <strong>{completedBatch.date}</strong>
                </div>
              </div>

              {/* Summary Strip */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded text-xs">
                <div>
                  <span className="text-slate-500 block">Total Students Credited:</span>
                  <strong className="text-slate-900 text-sm">{completedBatch.rowsCount} Learners</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Batch Sum Collected:</span>
                  <strong className="text-emerald-700 text-sm tabular-nums">
                    KES {completedBatch.totalCollected.toLocaleString()}.00
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Payment Method:</span>
                  <strong className="text-slate-900 text-sm">Excel Bulk Direct Inflow</strong>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-100 font-bold border-b border-slate-300 text-slate-800">
                    <tr>
                      <th className="p-2 border-r border-slate-300">Receipt No</th>
                      <th className="p-2 border-r border-slate-300">Student Name</th>
                      <th className="p-2 border-r border-slate-300">NEMIS UPI</th>
                      <th className="p-2 border-r border-slate-300">Stream</th>
                      <th className="p-2 text-right border-r border-slate-300">Prev Bal</th>
                      <th className="p-2 text-right border-r border-slate-300">Amount Paid</th>
                      <th className="p-2 text-right border-r border-slate-300">New Bal</th>
                      <th className="p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {completedBatch.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-mono border-r border-slate-300 text-slate-600">
                          {item.receiptNumber}
                        </td>
                        <td className="p-2 font-semibold text-slate-900 border-r border-slate-300">
                          {item.studentName}
                        </td>
                        <td className="p-2 font-mono text-slate-600 border-r border-slate-300">
                          {item.nemisUpi}
                        </td>
                        <td className="p-2 text-slate-700 border-r border-slate-300">
                          {item.stream}
                        </td>
                        <td className="p-2 text-right font-mono border-r border-slate-300 tabular-nums">
                          KES {item.previousBalance.toLocaleString()}
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-emerald-800 border-r border-slate-300 tabular-nums">
                          KES {item.amountPaid.toLocaleString()}
                        </td>
                        <td className="p-2 text-right font-mono font-bold border-r border-slate-300 tabular-nums">
                          KES {item.newBalance.toLocaleString()}
                        </td>
                        <td className="p-2 text-center">
                          {item.newBalance === 0 ? (
                            <span className="font-bold text-emerald-700">CLEARED</span>
                          ) : (
                            <span className="text-amber-700 font-medium">PARTIAL</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="pt-6 border-t-2 border-slate-300 grid grid-cols-2 gap-8 text-xs">
                <div>
                  <div className="h-8 border-b border-dashed border-slate-400"></div>
                  <span className="block mt-1 font-bold text-slate-800">School Bursar / Finance Officer</span>
                  <span className="text-[11px] text-slate-500">Zawadi JSS Revenue Office</span>
                </div>
                <div className="text-right">
                  <div className="h-8 border-b border-dashed border-slate-400 flex items-end justify-end">
                    <span className="text-[10px] text-emerald-800 uppercase font-bold tracking-widest border border-emerald-700 px-2 py-0.5 rounded mr-2">
                      Official Revenue Stamp
                    </span>
                  </div>
                  <span className="block mt-1 font-bold text-slate-800">Principal & Accounting Officer</span>
                  <span className="text-[11px] text-slate-500">Dr. Anthony K. Macharia</span>
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800"
              >
                Done & Return to Ledger
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
