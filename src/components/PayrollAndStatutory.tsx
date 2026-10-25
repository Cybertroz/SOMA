/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  DollarSign,
  FileText,
  Printer,
  Download,
  Building,
  CheckCircle2,
  Users,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { PayrollEmployee } from '../types/school';
import { exportToExcel } from '../utils/excelExport';

interface Props {
  employees: PayrollEmployee[];
  onAddEmployee?: (emp: PayrollEmployee) => void;
}

export function PayrollAndStatutory({ employees }: Props) {
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'payroll_sheet' | 'payslip' | 'statutory_summary'>('payroll_sheet');

  const selectedEmployee = employees.find((e) => e.id === selectedEmpId) || employees[0];

  const totalGross = employees.reduce((sum, e) => sum + e.grossPay, 0);
  const totalPaye = employees.reduce((sum, e) => sum + e.paye, 0);
  const totalSha = employees.reduce((sum, e) => sum + e.shaNhif, 0);
  const totalNssf = employees.reduce((sum, e) => sum + e.nssf, 0);
  const totalHousing = employees.reduce((sum, e) => sum + e.housingLevy, 0);
  const totalNet = employees.reduce((sum, e) => sum + e.netPay, 0);

  const handleExportPayrollExcel = () => {
    exportToExcel(
      'Limuru_Model_Staff_Payroll_Schedule_October_2026',
      employees,
      [
        { header: 'TSC / ID Number', key: 'tscOrIdNo' },
        { header: 'Employee Name', key: 'name' },
        { header: 'Cadre', key: 'cadre' },
        { header: 'Designation / Role', key: 'role' },
        { header: 'Basic Pay (KES)', key: 'basicSalary' },
        { header: 'House Allowance (KES)', key: 'houseAllowance' },
        { header: 'Commuter Allowance (KES)', key: 'commuterAllowance' },
        { header: 'Gross Pay (KES)', key: 'grossPay' },
        { header: 'PAYE (KRA Tax)', key: 'paye' },
        { header: 'SHA / NHIF (2.75%)', key: 'shaNhif' },
        { header: 'NSSF Tier I & II', key: 'nssf' },
        { header: 'Housing Levy (1.5%)', key: 'housingLevy' },
        { header: 'Net Salary (KES)', key: 'netPay' },
        { header: 'Status', key: 'status' },
      ]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            HR, Institutional Payroll & Kenyan Statutory Deductions
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Limuru Model School · Auto-calculates PAYE, SHA/NHIF (2.75%), NSSF, and Affordable Housing Levy (1.5%)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPayrollExcel}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            Export Bank Remittance Schedule (.csv)
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-5 rounded-t-lg text-xs font-semibold">
        <button
          onClick={() => setActiveTab('payroll_sheet')}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'payroll_sheet'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Master Payroll Sheet ({employees.length} Staff)
        </button>
        <button
          onClick={() => setActiveTab('payslip')}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'payslip'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Individual Payslip & P9 Form
        </button>
        <button
          onClick={() => setActiveTab('statutory_summary')}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'statutory_summary'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Statutory Remittances (KRA, SHA, NSSF)
        </button>
      </div>

      {activeTab === 'payroll_sheet' && (
        <div className="space-y-4">
          {/* Top Statutory Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-3.5 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Total Gross Payroll</span>
              <strong className="text-sm font-bold text-slate-900 tabular-nums">
                KES {totalGross.toLocaleString()}
              </strong>
            </div>
            <div className="bg-white p-3.5 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Total PAYE (KRA)</span>
              <strong className="text-sm font-bold text-rose-700 tabular-nums">
                KES {totalPaye.toLocaleString()}
              </strong>
            </div>
            <div className="bg-white p-3.5 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 block">SHA / NHIF (2.75%)</span>
              <strong className="text-sm font-bold text-sky-700 tabular-nums">
                KES {totalSha.toLocaleString()}
              </strong>
            </div>
            <div className="bg-white p-3.5 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 block">NSSF (Tier I & II)</span>
              <strong className="text-sm font-bold text-amber-700 tabular-nums">
                KES {totalNssf.toLocaleString()}
              </strong>
            </div>
            <div className="bg-white p-3.5 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Housing Levy (1.5%)</span>
              <strong className="text-sm font-bold text-purple-700 tabular-nums">
                KES {totalHousing.toLocaleString()}
              </strong>
            </div>
            <div className="bg-white p-3.5 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Net Payable to Bank</span>
              <strong className="text-sm font-bold text-emerald-700 tabular-nums">
                KES {totalNet.toLocaleString()}
              </strong>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Staff Details</th>
                    <th className="p-3">Cadre</th>
                    <th className="p-3 text-right">Basic Pay</th>
                    <th className="p-3 text-right">Allowances</th>
                    <th className="p-3 text-right">Gross Pay</th>
                    <th className="p-3 text-right">PAYE</th>
                    <th className="p-3 text-right">SHA (2.75%)</th>
                    <th className="p-3 text-right">NSSF</th>
                    <th className="p-3 text-right">Housing (1.5%)</th>
                    <th className="p-3 text-right">Net Pay</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{emp.name}</div>
                        <div className="font-mono text-[11px] text-slate-500">{emp.tscOrIdNo} · {emp.role}</div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            emp.cadre === 'TSC Permanent'
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {emp.cadre}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono tabular-nums">KES {emp.basicSalary.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono tabular-nums text-slate-600">
                        KES {(emp.houseAllowance + emp.commuterAllowance).toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                        KES {emp.grossPay.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-mono text-rose-700 tabular-nums">KES {emp.paye.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono text-sky-700 tabular-nums">KES {emp.shaNhif.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono text-amber-700 tabular-nums">KES {emp.nssf.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono text-purple-700 tabular-nums">KES {emp.housingLevy.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-800 tabular-nums">
                        KES {emp.netPay.toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedEmpId(emp.id);
                            setActiveTab('payslip');
                          }}
                          className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
                        >
                          View Payslip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payslip' && (
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-between no-print bg-white p-4 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-700">Select Employee:</span>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="text-xs bg-white border border-slate-300 rounded px-3 py-1.5 font-bold text-slate-900"
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.tscOrIdNo}) · {e.role}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Official Payslip
            </button>
          </div>

          {/* Official Printable Kenyan Payslip */}
          <div className="print-card bg-white p-8 rounded-lg border border-slate-200 shadow-sm space-y-6">
            <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
              <div className="text-xs uppercase tracking-widest text-slate-600 font-bold">
                Republic of Kenya · Teachers Service Commission / BoM
              </div>
              <h2 className="text-xl font-black text-slate-900 uppercase">
                Limuru Model Comprehensive School
              </h2>
              <div className="text-xs text-slate-600">
                P.O. Box 240-00217, Limuru · Payroll Voucher: Month of October 2026
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded text-xs">
              <div>
                <span className="text-slate-500 block">Employee Name:</span>
                <strong className="text-slate-900 text-sm">{selectedEmployee.name}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">TSC / Personal Number:</span>
                <strong className="font-mono text-slate-900">{selectedEmployee.tscOrIdNo}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Designation / Role:</span>
                <strong className="text-slate-900">{selectedEmployee.role}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Employment Cadre:</span>
                <strong className="text-emerald-800">{selectedEmployee.cadre}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Earnings */}
              <div className="border border-slate-200 rounded p-4 space-y-2.5">
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 uppercase text-[11px] text-emerald-800">
                  1. Gross Earnings Breakdown
                </h4>
                <div className="flex justify-between">
                  <span className="text-slate-600">Basic Salary:</span>
                  <strong className="tabular-nums font-mono">KES {selectedEmployee.basicSalary.toLocaleString()}.00</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">House Allowance:</span>
                  <strong className="tabular-nums font-mono">KES {selectedEmployee.houseAllowance.toLocaleString()}.00</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Commuter Allowance:</span>
                  <strong className="tabular-nums font-mono">KES {selectedEmployee.commuterAllowance.toLocaleString()}.00</strong>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                  <span>Gross Total Earnings:</span>
                  <span className="tabular-nums font-mono text-emerald-800">
                    KES {selectedEmployee.grossPay.toLocaleString()}.00
                  </span>
                </div>
              </div>

              {/* Statutory Deductions */}
              <div className="border border-slate-200 rounded p-4 space-y-2.5">
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 uppercase text-[11px] text-rose-800">
                  2. Statutory Deductions (Kenya)
                </h4>
                <div className="flex justify-between">
                  <span className="text-slate-600">PAYE (KRA Income Tax):</span>
                  <strong className="tabular-nums font-mono text-rose-700">KES {selectedEmployee.paye.toLocaleString()}.00</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Social Health Authority (SHA 2.75%):</span>
                  <strong className="tabular-nums font-mono text-sky-700">KES {selectedEmployee.shaNhif.toLocaleString()}.00</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">NSSF (Tier I & Tier II):</span>
                  <strong className="tabular-nums font-mono text-amber-700">KES {selectedEmployee.nssf.toLocaleString()}.00</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Affordable Housing Levy (1.5%):</span>
                  <strong className="tabular-nums font-mono text-purple-700">KES {selectedEmployee.housingLevy.toLocaleString()}.00</strong>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                  <span>Total Deductions:</span>
                  <span className="tabular-nums font-mono text-rose-800">
                    KES {(selectedEmployee.paye + selectedEmployee.shaNhif + selectedEmployee.nssf + selectedEmployee.housingLevy).toLocaleString()}.00
                  </span>
                </div>
              </div>
            </div>

            {/* Net Pay Callout */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-600 block">NET DISBURSEMENT PAYABLE:</span>
                <span className="text-xs text-slate-500">Transferred via KCB Electronic Funds Transfer (EFT)</span>
              </div>
              <div className="text-2xl font-black text-emerald-800 tabular-nums font-mono">
                KES {selectedEmployee.netPay.toLocaleString()}.00
              </div>
            </div>

            {/* Signatures */}
            <div className="pt-8 border-t-2 border-slate-300 grid grid-cols-2 gap-8 text-xs">
              <div>
                <div className="h-8 border-b border-dashed border-slate-400"></div>
                <span className="block mt-1 font-bold text-slate-800">School Bursar / Payroll Accountant</span>
              </div>
              <div className="text-right">
                <div className="h-8 border-b border-dashed border-slate-400"></div>
                <span className="block mt-1 font-bold text-slate-800">Principal / Secretary to BoM</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'statutory_summary' && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900">Kenyan Statutory Remittance Compliance Matrix</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <strong className="text-slate-900 block font-bold">Kenya Revenue Authority (KRA)</strong>
              <div className="text-slate-600">PIN: P051289190K</div>
              <div className="text-base font-bold text-rose-700">KES {totalPaye.toLocaleString()}</div>
              <span className="text-[10px] text-slate-500 block">Due 9th of each month via iTax</span>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <strong className="text-slate-900 block font-bold">Social Health Authority (SHA)</strong>
              <div className="text-slate-600">SHIF Employer Code: SHIF/08129</div>
              <div className="text-base font-bold text-sky-700">KES {totalSha.toLocaleString()}</div>
              <span className="text-[10px] text-slate-500 block">Standard 2.75% Gross statutory deduction</span>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <strong className="text-slate-900 block font-bold">National Social Security Fund (NSSF)</strong>
              <div className="text-slate-600">NSSF Reg: 2049102</div>
              <div className="text-base font-bold text-amber-700">KES {totalNssf.toLocaleString()}</div>
              <span className="text-[10px] text-slate-500 block">Tier I (420) + Tier II (1,740) Cap</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
