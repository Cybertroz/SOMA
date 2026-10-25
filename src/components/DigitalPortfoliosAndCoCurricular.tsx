/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  HeartPulse,
  Award,
  ShieldAlert,
  UserCheck,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import { Learner, DisciplineIncident } from '../types/school';
import { exportToExcel } from '../utils/excelExport';

interface Props {
  students: Learner[];
  onAddDisciplineIncident: (studentId: string, incident: DisciplineIncident) => void;
}

export function DigitalPortfoliosAndCoCurricular({ students, onAddDisciplineIncident }: Props) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [isAddIncidentOpen, setIsAddIncidentOpen] = useState(false);
  const [incidentForm, setIncidentForm] = useState({
    nature: '',
    actionTaken: 'Guidance and counseling session held with deputy principal.',
    reportedBy: 'Class Teacher',
    status: 'Resolved' as DisciplineIncident['status'],
  });

  const student = students.find((s) => s.id === selectedStudentId) || students[0];

  const handleAddIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !incidentForm.nature.trim()) return;

    const newIncident: DisciplineIncident = {
      id: `disc_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      nature: incidentForm.nature.trim(),
      actionTaken: incidentForm.actionTaken.trim(),
      reportedBy: incidentForm.reportedBy.trim(),
      status: incidentForm.status,
    };

    onAddDisciplineIncident(student.id, newIncident);
    setIncidentForm({
      nature: '',
      actionTaken: 'Guidance and counseling session held with deputy principal.',
      reportedBy: 'Class Teacher',
      status: 'Resolved',
    });
    setIsAddIncidentOpen(false);
  };

  const handleExportPortfolioExcel = () => {
    exportToExcel(
      'Limuru_Model_Learner_CoCurricular_and_Health_Register',
      students,
      [
        { header: 'Admission No', key: 'admissionNo' },
        { header: 'Learner Name', key: 'name' },
        { header: 'Grade', key: 'grade' },
        { header: 'Stream', key: 'stream' },
        { header: 'Blood Group', key: (s) => s.bloodGroup || 'O+' },
        { header: 'Medical / Allergies', key: (s) => s.medicalAllergies || 'None' },
        { header: 'Co-Curricular & Sports', key: 'coCurricular' },
        { header: 'Attendance (%)', key: (s) => `${s.attendancePercent}%` },
        { header: 'Discipline Incident Count', key: (s) => s.disciplineIncidents.length },
      ]
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">
              Digital Portfolios, Health & Co-Curricular Tracking
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Limuru Model School · Medical records, discipline & character development, sports and clubs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPortfolioExcel}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            Export Portfolios (.csv)
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Learner selector list */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-200 bg-slate-50 font-bold text-slate-900 text-xs">
            Select Learner Profile:
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {students.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStudentId(s.id)}
                className={`w-full text-left p-3 transition-colors flex items-center justify-between ${
                  s.id === student?.id ? 'bg-emerald-50 text-emerald-950 font-bold' : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div>
                  <div className="text-xs">{s.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {s.admissionNo} · {s.grade}
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                  {s.stream}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Portfolio Details */}
        {student && (
          <div className="lg:col-span-2 space-y-5">
            {/* Health & Medical Card */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm border-b border-slate-100 pb-2">
                <HeartPulse className="w-4 h-4" />
                <span>Health & Emergency Medical Profile: {student.name}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-500 block">Blood Group:</span>
                  <strong className="text-slate-900 font-bold">{student.bloodGroup || 'O+'}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-500 block">Attendance Rate:</span>
                  <strong className="text-emerald-700 font-bold">{student.attendancePercent}%</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-100 col-span-2 sm:col-span-1">
                  <span className="text-slate-500 block">Emergency Guardian Contact:</span>
                  <strong className="text-slate-900 font-mono text-[11px]">{student.guardianPhone}</strong>
                </div>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-950">
                <strong className="block mb-0.5">Medical Allergies & Pre-Existing Health Conditions:</strong>
                <p className="text-rose-900 leading-relaxed">
                  {student.medicalAllergies || 'No known chronic allergies or dietary restrictions recorded.'}
                </p>
              </div>
            </div>

            {/* Co-Curricular & Clubs Card */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm border-b border-slate-100 pb-2">
                <Award className="w-4 h-4" />
                <span>Co-Curricular, Talent & Club Involvement</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{student.coCurricular}</p>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded text-xs">
                <span className="font-bold text-slate-800 block mb-0.5">Values & Character Conduct:</span>
                <p className="text-slate-600 leading-relaxed">{student.valuesNotes}</p>
              </div>
            </div>

            {/* Discipline & Guidance Counseling Record */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <ShieldAlert className="w-4 h-4 text-slate-600" />
                  <span>Guidance, Counseling & Discipline Register</span>
                </div>
                <button
                  onClick={() => setIsAddIncidentOpen(true)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Log Note
                </button>
              </div>

              {student.disciplineIncidents.length === 0 ? (
                <div className="p-4 text-center text-xs text-emerald-700 bg-emerald-50 rounded border border-emerald-100 font-medium">
                  ✓ Exemplary record. No disciplinary infractions or formal guidance interventions logged.
                </div>
              ) : (
                <div className="space-y-2">
                  {student.disciplineIncidents.map((inc) => (
                    <div key={inc.id} className="p-3 rounded border border-slate-200 bg-slate-50 text-xs space-y-1">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>{inc.nature}</span>
                        <span className="text-[11px] text-slate-500 font-normal">{inc.date}</span>
                      </div>
                      <p className="text-slate-600">{inc.actionTaken}</p>
                      <div className="text-[10px] text-slate-400">Recorded by: {inc.reportedBy} · Status: {inc.status}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Incident Modal */}
      {isAddIncidentOpen && student && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Log Guidance & Counseling Incident
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Learner: <strong>{student.name}</strong> ({student.admissionNo})
            </p>

            <form onSubmit={handleAddIncident} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nature of Incident / Observation:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Minor lateness or peer conflict"
                  value={incidentForm.nature}
                  onChange={(e) => setIncidentForm({ ...incidentForm, nature: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Action Taken / Counseling Guidance:</label>
                <textarea
                  rows={3}
                  value={incidentForm.actionTaken}
                  onChange={(e) => setIncidentForm({ ...incidentForm, actionTaken: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Staff Member / Appraiser:</label>
                <input
                  type="text"
                  value={incidentForm.reportedBy}
                  onChange={(e) => setIncidentForm({ ...incidentForm, reportedBy: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddIncidentOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold shadow-xs"
                >
                  Save Incident Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
