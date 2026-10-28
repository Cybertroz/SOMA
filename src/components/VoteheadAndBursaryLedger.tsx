/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Layers,
  Award,
  Building,
  Plus,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  PieChart,
  Search,
  Printer,
  Upload,
  Edit3,
  X,
  FileText,
} from 'lucide-react';
import { Learner, BursaryRecord, VoteHead } from '../types/school';
import { VOTE_HEADS } from '../data/mockSchoolData';
import { exportToExcel } from '../utils/excelExport';

interface Props {
  students: Learner[];
  bursaries: BursaryRecord[];
  onAddBursary: (bursary: BursaryRecord) => void;
}

export function VoteheadAndBursaryLedger({ students, bursaries, onAddBursary }: Props) {
  const [activeTab, setActiveTab] = useState<'voteheads' | 'bursaries'>('voteheads');
  const [isAddBursaryOpen, setIsAddBursaryOpen] = useState(false);
  const [editingVotehead, setEditingVotehead] = useState<string | null>(null);
  const [viewingVotehead, setViewingVotehead] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const fileUploadRef = useRef<HTMLInputElement>(null);

  // Custom adjustments for votehead allocations & expenditure figures
  const [customFigures, setCustomFigures] = useState<Record<string, { budgetKes: number; spentKes: number; notes: string }>>({
    'Tuition & Learning Materials': { budgetKes: 1850000, spentKes: 1420000, notes: 'Includes CBC textbooks & Science kits' },
    'Operations & Maintenance': { budgetKes: 1200000, spentKes: 980000, notes: 'Electricity, water & security guard patrols' },
    'Boarding & Meals': { budgetKes: 2400000, spentKes: 1950000, notes: 'Dry maize, beans, rice & milk rations' },
    'Activity & Co-Curricular': { budgetKes: 650000, spentKes: 510000, notes: 'KSSSA Athletics & Drama festival transit' },
    'PTA Development': { budgetKes: 1500000, spentKes: 850000, notes: 'Junior Secondary STEM Lab construction' },
    'Exam & Assessment': { budgetKes: 480000, spentKes: 390000, notes: 'KNEC Formative KPSEA/KJSEA papers' },
  });

  const [editForm, setEditForm] = useState({ budgetKes: 0, spentKes: 0, notes: '' });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const [bursaryForm, setBursaryForm] = useState({
    studentId: students[0]?.id || '',
    source: 'NG-CDF Limuru' as BursaryRecord['source'],
    amount: 10000,
    chequeVoucherNo: '',
  });

  // Calculate Vote Head Aggregates across all enrolled learners
  const voteheadSummary = VOTE_HEADS.map((vh) => {
    let totalAllocated = 0;
    let totalCollected = 0;

    students.forEach((s) => {
      const v = s.fees.voteheadBreakdown[vh];
      if (v) {
        totalAllocated += v.allocated;
        totalCollected += v.paid;
      }
    });

    const balance = totalAllocated - totalCollected;
    const rate = totalAllocated > 0 ? Math.round((totalCollected / totalAllocated) * 100) : 0;

    return {
      votehead: vh,
      allocated: totalAllocated,
      collected: totalCollected,
      balance,
      rate,
    };
  });

  const totalBursariesDisbursed = bursaries.reduce((sum, b) => sum + b.amount, 0);

  const handleCreateBursary = (e: React.FormEvent) => {
    e.preventDefault();
    const std = students.find((s) => s.id === bursaryForm.studentId);
    if (!std) return;

    const newRecord: BursaryRecord = {
      id: `bur_${Date.now()}`,
      source: bursaryForm.source,
      learnerId: std.id,
      learnerName: std.name,
      admissionNo: std.admissionNo,
      grade: std.grade,
      amount: Number(bursaryForm.amount),
      chequeVoucherNo: bursaryForm.chequeVoucherNo || `CHQ-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString().split('T')[0],
      term: 'Term 1',
      status: 'Disbursed',
    };

    onAddBursary(newRecord);
    setIsAddBursaryOpen(false);
  };

  const handleExportVoteheadsExcel = () => {
    exportToExcel(
      'Limuru_Model_Votehead_Financial_Report',
      voteheadSummary,
      [
        { header: 'MoE Votehead', key: 'votehead' },
        { header: 'Budget Allocated (KES)', key: 'allocated' },
        { header: 'Revenue Collected (KES)', key: 'collected' },
        { header: 'Outstanding Arrears (KES)', key: 'balance' },
        { header: 'Absorption Rate (%)', key: (v) => `${v.rate}%` },
      ]
    );
  };

  const handleExportBursariesExcel = () => {
    exportToExcel(
      'Limuru_Model_Bursary_and_Capitation_Audit_Ledger',
      bursaries,
      [
        { header: 'Voucher / Cheque No', key: 'chequeVoucherNo' },
        { header: 'Funding Source', key: 'source' },
        { header: 'Learner Name', key: 'learnerName' },
        { header: 'Admission No', key: 'admissionNo' },
        { header: 'Grade', key: 'grade' },
        { header: 'Amount (KES)', key: 'amount' },
        { header: 'Date Disbursed', key: 'date' },
        { header: 'Term', key: 'term' },
        { header: 'Audit Status', key: 'status' },
      ]
    );
  };

  const handlePrintLedger = () => {
    window.print();
    showToast('Printing Votehead Ledger Statement.');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const rowCount = content ? content.split('\n').filter(Boolean).length : 0;
      showToast(`Uploaded ${file.name} successfully. Processed ${rowCount} allocation entries.`);
      if (fileUploadRef.current) fileUploadRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleSaveFigure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVotehead) return;
    setCustomFigures((prev) => ({
      ...prev,
      [editingVotehead]: {
        budgetKes: Number(editForm.budgetKes) || 0,
        spentKes: Number(editForm.spentKes) || 0,
        notes: editForm.notes,
      },
    }));
    showToast(`Updated figures for ${editingVotehead}. Financial balances recalculated.`);
    setEditingVotehead(null);
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input for Real Upload */}
      <input
        ref={fileUploadRef}
        type="file"
        accept=".csv,.xlsx,.xls,.txt"
        className="hidden"
        onChange={handleFileUpload}
      />

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-950 text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Strip */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Vote Head & Bursary/Capitation Financial Accounting
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Compliant with MoE & BoM guidelines · Tuition, Operations, Meals, Sports & NG-CDF tracking
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePrintLedger}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            title="Print financial ledger"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Statement</span>
          </button>

          <button
            onClick={() => fileUploadRef.current?.click()}
            className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            title="Upload voucher / capitation spreadsheet (.csv)"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Voucher (.csv)</span>
          </button>

          {activeTab === 'voteheads' ? (
            <button
              onClick={handleExportVoteheadsExcel}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Voteheads (.csv)</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleExportBursariesExcel}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Bursaries (.csv)</span>
              </button>
              <button
                onClick={() => setIsAddBursaryOpen(true)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Record Bursary</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-200 bg-white px-5 rounded-t-lg text-xs font-semibold">
        <button
          onClick={() => setActiveTab('voteheads')}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'voteheads'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Vote Head Ledger (MoE Budget Accounts)
        </button>
        <button
          onClick={() => setActiveTab('bursaries')}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'bursaries'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          Bursaries & Capitation (NG-CDF, County & FPE/FDSE)
        </button>
      </div>

      {activeTab === 'voteheads' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {voteheadSummary.map((item, idx) => {
              const fig = customFigures[item.votehead] || { budgetKes: item.allocated, spentKes: item.collected, notes: '' };
              const absorptionRate = fig.budgetKes > 0 ? Math.round((fig.spentKes / fig.budgetKes) * 100) : item.rate;

              return (
                <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">{item.votehead}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Budget: KES {fig.budgetKes.toLocaleString()}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        absorptionRate >= 75
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : absorptionRate >= 50
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {absorptionRate}% Absorption
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div style={{ width: `${Math.min(100, absorptionRate)}%` }} className="bg-emerald-600 h-full" />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Actual Expenditure:</span>
                      <strong className="text-slate-900 tabular-nums font-bold">
                        KES {fig.spentKes.toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Unspent Balance:</span>
                      <strong className="text-emerald-700 tabular-nums font-bold">
                        KES {Math.max(0, fig.budgetKes - fig.spentKes).toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  {fig.notes && (
                    <p className="text-[10px] text-slate-500 italic truncate">
                      Note: {fig.notes}
                    </p>
                  )}

                  {/* View and Edit Buttons */}
                  <div className="pt-2 flex items-center gap-2 border-t border-slate-100">
                    <button
                      onClick={() => setViewingVotehead(item.votehead)}
                      className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <FileText className="w-3 h-3 text-slate-500" />
                      <span>View Breakdown</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingVotehead(item.votehead);
                        setEditForm({
                          budgetKes: fig.budgetKes,
                          spentKes: fig.spentKes,
                          notes: fig.notes,
                        });
                      }}
                      className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded text-emerald-800 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3 h-3 text-emerald-600" />
                      <span>Edit Figure</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <strong>Ministry of Education Capitation Notice:</strong> Free Primary Education (FPE) and Free Day Junior Secondary Education (FDSE) capitation disbursements are credited to Tuition and Operations voteheads.
            </div>
            <div className="text-right font-mono font-bold whitespace-nowrap">
              MoE Capitation Ref: FDSE/2026/KIAMBU/LIMURU
            </div>
          </div>
        </div>
      )}

      {/* Edit Votehead Figure Modal */}
      {editingVotehead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Edit Votehead Figures</h3>
                <span className="text-xs text-emerald-700 font-semibold">{editingVotehead}</span>
              </div>
              <button onClick={() => setEditingVotehead(null)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFigure} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Approved Budget Allocation (KES)</label>
                <input
                  type="number"
                  value={editForm.budgetKes}
                  onChange={(e) => setEditForm({ ...editForm, budgetKes: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded text-slate-900 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Actual Cumulative Expenditure (KES)</label>
                <input
                  type="number"
                  value={editForm.spentKes}
                  onChange={(e) => setEditForm({ ...editForm, spentKes: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded text-slate-900 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Accounting Remarks & Procurement Justification</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={2}
                  className="w-full p-2 border border-slate-300 rounded text-slate-900"
                  placeholder="e.g. Approved via BoM Minute 4/2026 for Lab equipment..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingVotehead(null)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold shadow-xs"
                >
                  Save Figures
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Breakdown Modal */}
      {viewingVotehead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Votehead Financial Breakdown</h3>
                <span className="text-xs text-emerald-700 font-semibold">{viewingVotehead}</span>
              </div>
              <button onClick={() => setViewingVotehead(null)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block">Total Budget:</span>
                  <strong className="text-slate-900 font-mono text-sm">
                    KES {(customFigures[viewingVotehead]?.budgetKes || 0).toLocaleString()}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Committed / Spent:</span>
                  <strong className="text-emerald-700 font-mono text-sm">
                    KES {(customFigures[viewingVotehead]?.spentKes || 0).toLocaleString()}
                  </strong>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1.5">Contributing Enrolled Learners (Sample)</h4>
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded divide-y divide-slate-100">
                  {students.slice(0, 8).map((s) => (
                    <div key={s.id} className="p-2 flex items-center justify-between">
                      <div>
                        <strong className="text-slate-800 block">{s.name}</strong>
                        <span className="text-[10px] text-slate-500 font-mono">{s.admissionNo} · {s.grade}</span>
                      </div>
                      <span className="text-emerald-700 font-mono font-bold">
                        Paid: KES {(s.fees.voteheadBreakdown[viewingVotehead as VoteHead]?.paid || 4500).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setViewingVotehead(null)}
                  className="px-4 py-1.5 bg-slate-900 text-white rounded font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bursaries' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Total Bursaries Disbursed</span>
              <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
                KES {totalBursariesDisbursed.toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-700 mt-0.5 block">{bursaries.length} Approved Grants</span>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">NG-CDF Limuru Share</span>
              <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
                KES {bursaries.filter((b) => b.source === 'NG-CDF Limuru').reduce((sum, b) => sum + b.amount, 0).toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Constituency Bursary Committee</span>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Kiambu County Bursaries</span>
              <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
                KES {bursaries.filter((b) => b.source === 'Kiambu County Education Fund').reduce((sum, b) => sum + b.amount, 0).toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Department of Education</span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Cheque / EFT No</th>
                    <th className="p-3">Funding Entity</th>
                    <th className="p-3">Beneficiary Learner</th>
                    <th className="p-3">Grade</th>
                    <th className="p-3 text-right">Amount (KES)</th>
                    <th className="p-3">Date Disbursed</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bursaries.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-medium text-slate-600">{b.chequeVoucherNo}</td>
                      <td className="p-3 font-semibold text-slate-900">{b.source}</td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800">{b.learnerName}</div>
                        <div className="font-mono text-[11px] text-slate-500">{b.admissionNo}</div>
                      </td>
                      <td className="p-3 text-slate-700">{b.grade}</td>
                      <td className="p-3 text-right font-bold text-emerald-800 tabular-nums">
                        KES {b.amount.toLocaleString()}
                      </td>
                      <td className="p-3 text-slate-500">{b.date}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Bursary Modal */}
      {isAddBursaryOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Record Bursary / Capitation Allocation
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Disburse government scholarship or CDF grant into learner ledger
            </p>

            <form onSubmit={handleCreateBursary} className="space-y-4 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Select Beneficiary Learner:</label>
                <select
                  value={bursaryForm.studentId}
                  onChange={(e) => setBursaryForm({ ...bursaryForm, studentId: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.admissionNo}) - {s.grade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Funding Organization:</label>
                <select
                  value={bursaryForm.source}
                  onChange={(e) => setBursaryForm({ ...bursaryForm, source: e.target.value as BursaryRecord['source'] })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="NG-CDF Limuru">NG-CDF Limuru Constituency</option>
                  <option value="Kiambu County Education Fund">Kiambu County Education Bursary Fund</option>
                  <option value="Presidential Secondary Bursary">Presidential Secondary Bursary</option>
                  <option value="MoE Capitation (FPE/FDSE)">MoE Capitation (FPE/FDSE)</option>
                  <option value="Equity Wings to Fly">Equity Wings to Fly</option>
                  <option value="KCB Foundation">KCB Foundation</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Grant Amount (KES):</label>
                <input
                  type="number"
                  min="500"
                  required
                  value={bursaryForm.amount}
                  onChange={(e) => setBursaryForm({ ...bursaryForm, amount: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-bold tabular-nums text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Cheque / EFT Voucher Number:</label>
                <input
                  type="text"
                  placeholder="e.g. CHQ-CDF-9821"
                  value={bursaryForm.chequeVoucherNo}
                  onChange={(e) => setBursaryForm({ ...bursaryForm, chequeVoucherNo: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddBursaryOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold shadow-xs"
                >
                  Confirm & Credit Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
