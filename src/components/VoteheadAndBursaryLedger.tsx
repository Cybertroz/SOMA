/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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

  return (
    <div className="space-y-6">
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

        <div className="flex items-center gap-2">
          {activeTab === 'voteheads' ? (
            <button
              onClick={handleExportVoteheadsExcel}
              className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              Export Votehead Statement (.csv)
            </button>
          ) : (
            <>
              <button
                onClick={handleExportBursariesExcel}
                className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                Export Bursaries (.csv)
              </button>
              <button
                onClick={() => setIsAddBursaryOpen(true)}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Record Bursary / Capitation
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
            {voteheadSummary.map((item, idx) => (
              <div key={idx} className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <span className="font-bold text-slate-900 text-xs">{item.votehead}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.rate >= 75
                        ? 'bg-emerald-50 text-emerald-700'
                        : item.rate >= 50
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {item.rate}% Paid
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div style={{ width: `${item.rate}%` }} className="bg-emerald-600 h-full" />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Collected:</span>
                    <strong className="text-emerald-700 tabular-nums font-bold">
                      KES {item.collected.toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Balance:</span>
                    <strong className="text-rose-600 tabular-nums font-bold">
                      KES {item.balance.toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
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
