/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Smartphone,
  CheckCircle2,
  RefreshCw,
  Send,
  Radio,
  FileSpreadsheet,
  AlertCircle,
  Copy,
  Receipt,
  Layers,
} from 'lucide-react';
import { Learner, DarajaMpesaPayment, VoteHead } from '../types/school';
import { exportToExcel } from '../utils/excelExport';

interface Props {
  students: Learner[];
  payments: DarajaMpesaPayment[];
  onProcessPayment: (payment: DarajaMpesaPayment) => void;
}

export function DarajaMpesaSync({ students, payments, onProcessPayment }: Props) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [amount, setAmount] = useState<number>(10000);
  const [phone, setPhone] = useState<string>('254722890144');
  const [selectedVotehead, setSelectedVotehead] = useState<VoteHead>('Tuition & Learning Materials');
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState<'simulator' | 'webhook_log' | 'api_docs'>('simulator');
  const [lastProcessed, setLastProcessed] = useState<DarajaMpesaPayment | null>(null);

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || amount <= 0) return;

    setIsSimulating(true);

    setTimeout(() => {
      // Generate authentic Safaricom Daraja TransID e.g. 'SHG89X02KL'
      const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
      const numbers = '0123456789';
      let code = '';
      for (let i = 0; i < 4; i++) code += letters.charAt(Math.floor(Math.random() * letters.length));
      for (let i = 0; i < 2; i++) code += numbers.charAt(Math.floor(Math.random() * numbers.length));
      for (let i = 0; i < 4; i++) code += letters.charAt(Math.floor(Math.random() * letters.length));

      const timeStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const receiptNum = `LMS/DAR/2026/${Math.floor(1000 + Math.random() * 9000)}`;

      const newPayment: DarajaMpesaPayment = {
        transId: code,
        billRefNumber: selectedStudent.admissionNo,
        msisdn: phone.startsWith('+') ? phone.slice(1) : phone,
        firstName: selectedStudent.guardianName.split(' ')[0] || 'Guardian',
        transAmount: Number(amount),
        transTime: timeStr,
        matchedLearnerId: selectedStudent.id,
        matchedLearnerName: selectedStudent.name,
        allocatedVotehead: selectedVotehead,
        receiptNumber: receiptNum,
        smsStatus: 'Sent',
        rawPayload: JSON.stringify(
          {
            TransactionType: 'Pay Bill',
            TransID: code,
            TransTime: timeStr.replace(/[- :]/g, ''),
            TransAmount: amount.toString(),
            BusinessShortCode: '522123',
            BillRefNumber: selectedStudent.admissionNo,
            InvoiceNumber: receiptNum,
            OrgAccountBalance: '1428500.00',
            ThirdPartyTransID: '',
            MSISDN: phone,
            FirstName: selectedStudent.guardianName.split(' ')[0],
          },
          null,
          2
        ),
      };

      onProcessPayment(newPayment);
      setLastProcessed(newPayment);
      setIsSimulating(false);
    }, 600);
  };

  const handleExportExcel = () => {
    exportToExcel(
      'Limuru_Model_Safaricom_Daraja_Mpesa_Sync_Report',
      payments,
      [
        { header: 'Receipt No', key: 'receiptNumber' },
        { header: 'Trans ID (M-Pesa Ref)', key: 'transId' },
        { header: 'Account / Adm No', key: 'billRefNumber' },
        { header: 'Learner Name', key: 'matchedLearnerName' },
        { header: 'Amount (KES)', key: 'transAmount' },
        { header: 'Target Votehead', key: 'allocatedVotehead' },
        { header: 'Payer Phone', key: 'msisdn' },
        { header: 'Timestamp', key: 'transTime' },
        { header: 'SMS Callback', key: 'smsStatus' },
      ]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Strip */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-lg font-bold text-slate-900">
              Safaricom Daraja API 2.0 Real-Time C2B Paybill Sync
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Limuru Model School Paybill: <strong>522123</strong> · Instant student balance clearing, votehead allocation & SMS dispatch
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            Export M-Pesa Ledger (.csv)
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-5 rounded-t-lg text-xs font-semibold">
        <button
          onClick={() => setActiveTab('simulator')}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'simulator'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          Live Payment Webhook Simulator
        </button>
        <button
          onClick={() => setActiveTab('webhook_log')}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'webhook_log'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Radio className="w-4 h-4" />
          Audit Log ({payments.length} Transactions)
        </button>
      </div>

      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Simulator Form */}
          <div className="lg:col-span-2 bg-white p-6 rounded-b-lg border border-slate-200 shadow-xs space-y-5">
            <h3 className="font-semibold text-slate-900 text-sm">
              Simulate Incoming Safaricom Paybill Transaction
            </h3>

            <form onSubmit={handleSimulatePayment} className="space-y-4 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  Select Enrolled Learner (BillRefNumber = Admission No):
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => {
                    setSelectedStudentId(e.target.value);
                    const std = students.find((s) => s.id === e.target.value);
                    if (std) {
                      setPhone(std.guardianPhone.replace(/\D/g, '') || '254722890144');
                      if (std.fees.balance > 0) setAmount(std.fees.balance);
                    }
                  }}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.admissionNo}) · {s.grade} - {s.stream} · Bal: KES {s.fees.balance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Transaction Amount (KES):</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-bold text-slate-900 tabular-nums focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Safaricom Mobile (MSISDN):</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  Target Votehead for Direct Allocation:
                </label>
                <select
                  value={selectedVotehead}
                  onChange={(e) => setSelectedVotehead(e.target.value as VoteHead)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Tuition & Learning Materials">Tuition & Learning Materials</option>
                  <option value="Operations & Maintenance">Operations & Maintenance</option>
                  <option value="Boarding & Meals">Boarding & Meals</option>
                  <option value="Activity & Co-Curricular">Activity & Co-Curricular</option>
                  <option value="PTA Development">PTA Development</option>
                  <option value="Exam & Assessment">Exam & Assessment</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-600 text-[11px] space-y-1">
                <div className="font-semibold text-slate-800">Daraja 2.0 Webhook Verification:</div>
                <div className="font-mono text-slate-500">
                  Endpoint: https://api.limurumodelschool.sc.ke/api/v2/c2b/validation_url
                </div>
                <div>Simulates instant callback reconciliation with KES 0 transaction charges to school.</div>
              </div>

              <button
                type="submit"
                disabled={isSimulating}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Executing Daraja Webhook Handshake...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Simulate C2B Push & Reconcile Account
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Real-time SMS preview card */}
          <div className="space-y-4">
            <div className="bg-slate-900 text-white p-5 rounded-lg border border-slate-800 shadow-md">
              <div className="flex items-center gap-2 text-emerald-400 mb-3 text-xs font-bold uppercase tracking-wider">
                <Smartphone className="w-4 h-4" />
                Automated Parent SMS Receipt
              </div>

              {lastProcessed ? (
                <div className="bg-slate-800/90 p-4 rounded-lg font-mono text-xs text-emerald-300 space-y-2 border border-slate-700">
                  <div>
                    <strong>{lastProcessed.transId}</strong> Confirmed.
                  </div>
                  <div className="text-slate-200">
                    Ksh {lastProcessed.transAmount.toLocaleString()}.00 received from {lastProcessed.msisdn} on {lastProcessed.transTime}.
                  </div>
                  <div className="text-slate-300">
                    Student: <strong>{lastProcessed.matchedLearnerName}</strong> ({lastProcessed.billRefNumber}).
                  </div>
                  <div className="text-emerald-400 pt-1 border-t border-slate-700">
                    Votehead: {lastProcessed.allocatedVotehead}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Official Receipt: {lastProcessed.receiptNumber}
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 text-xs italic py-6 text-center">
                  Trigger a payment to view the automated Safaricom Daraja confirmation SMS payload.
                </div>
              )}
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 text-xs space-y-2">
              <span className="font-semibold text-slate-800 block">Safaricom Integration Specs:</span>
              <div className="flex justify-between text-slate-600">
                <span>ShortCode:</span>
                <strong className="font-mono text-slate-900">522123 (Paybill)</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Account Reference:</span>
                <strong className="font-mono text-slate-900">Learner Admission No</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Settlement Bank:</span>
                <strong className="text-slate-900">KCB Bank Limuru Branch</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'webhook_log' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="p-3">Receipt No</th>
                  <th className="p-3">M-Pesa TransID</th>
                  <th className="p-3">Learner & Adm No</th>
                  <th className="p-3">Payer MSISDN</th>
                  <th className="p-3 text-right">Amount (KES)</th>
                  <th className="p-3">Allocated Votehead</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3 text-center">SMS Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-medium text-slate-600">{p.receiptNumber}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">{p.transId}</td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{p.matchedLearnerName}</div>
                      <div className="font-mono text-[11px] text-slate-500">{p.billRefNumber}</div>
                    </td>
                    <td className="p-3 font-mono text-slate-600">{p.msisdn}</td>
                    <td className="p-3 text-right font-bold text-emerald-700 tabular-nums">
                      KES {p.transAmount.toLocaleString()}
                    </td>
                    <td className="p-3 text-slate-700">{p.allocatedVotehead}</td>
                    <td className="p-3 text-slate-500">{p.transTime}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {p.smsStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
