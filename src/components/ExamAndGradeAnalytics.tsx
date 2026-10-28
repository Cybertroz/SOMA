/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BarChart3,
  Award,
  TrendingUp,
  FileSpreadsheet,
  Download,
  Users,
  CheckCircle2,
  PieChart,
  Printer,
} from 'lucide-react';
import { Learner, GradeLevel } from '../types/school';
import { ALL_GRADES, ALL_LEARNING_AREAS } from '../data/mockSchoolData';
import { exportToExcel } from '../utils/excelExport';

interface Props {
  students: Learner[];
}

export function ExamAndGradeAnalytics({ students }: Props) {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | 'All'>('All');

  const filteredStudents = selectedGrade === 'All' ? students : students.filter((s) => s.grade === selectedGrade);

  // Subject analytics
  const subjectStats = ALL_LEARNING_AREAS.map((subj) => {
    let count = 0;
    let sum = 0;
    let ee = 0, me = 0, ae = 0, be = 0;

    filteredStudents.forEach((std) => {
      const ass = std.assessments[subj.id];
      if (ass) {
        count++;
        sum += ass.summativeScore;
        if (ass.level === 'EE') ee++;
        else if (ass.level === 'ME') me++;
        else if (ass.level === 'AE') ae++;
        else be++;
      }
    });

    const mean = count > 0 ? Number((sum / count).toFixed(1)) : 0;
    const proficiencyRate = count > 0 ? Math.round(((ee + me) / count) * 100) : 0;

    return {
      subjectId: subj.id,
      name: subj.name,
      code: subj.code,
      leadTeacher: subj.leadTeacher,
      candidates: count,
      meanScore: mean,
      proficiencyRate,
      ee,
      me,
      ae,
      be,
    };
  }).filter((s) => s.candidates > 0);

  const overallMean =
    subjectStats.length > 0
      ? Number((subjectStats.reduce((acc, s) => acc + s.meanScore, 0) / subjectStats.length).toFixed(1))
      : 0;

  const handleExportAnalyticsExcel = () => {
    exportToExcel(
      `Limuru_Model_KNEC_CBC_Exam_Analysis_${selectedGrade.replace(' ', '_')}`,
      subjectStats,
      [
        { header: 'Learning Area', key: 'name' },
        { header: 'Subject Code', key: 'code' },
        { header: 'Candidates Tested', key: 'candidates' },
        { header: 'Mean Score (%)', key: 'meanScore' },
        { header: 'Mastery / Proficiency Rate (%)', key: (s) => `${s.proficiencyRate}%` },
        { header: 'Exceeding (EE)', key: 'ee' },
        { header: 'Meeting (ME)', key: 'me' },
        { header: 'Approaching (AE)', key: 'ae' },
        { header: 'Below (BE)', key: 'be' },
        { header: 'Lead Educator', key: 'leadTeacher' },
      ]
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">
              KNEC CBC Exam & Grade Performance Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Limuru Model Comprehensive School · KPSEA (Grade 6) & KJSEA (Grade 9) transition tracking
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value as any)}
            className="text-xs bg-white border border-slate-300 rounded px-3 py-2 font-bold text-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="All">All Grades (Schoolwide)</option>
            {ALL_GRADES.map((g) => (
              <option key={g} value={g}>
                {g} Performance
              </option>
            ))}
          </select>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors border border-slate-300"
            title="Print KNEC Exam Analytics Report"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleExportAnalyticsExcel}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export KNEC Analysis (.csv)
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Assessed Cohort</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {filteredStudents.length} Learners
          </div>
          <span className="text-[11px] text-emerald-700 mt-0.5 block">100% NEMIS Registered</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Composite School Mean Score</span>
          <div className="text-2xl font-bold text-emerald-800 mt-1 tabular-nums">
            {overallMean}%
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Overall Level: Meeting Expectations (ME)</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">KPSEA Transition Readiness</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            94.2% Ready
          </div>
          <span className="text-[11px] text-emerald-700 mt-0.5 block">Grade 6 Candidate Cohort</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">KJSEA JSS Transition</span>
          <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            96.8% Ready
          </div>
          <span className="text-[11px] text-sky-700 mt-0.5 block">Grade 9 Senior School Pathways</span>
        </div>
      </div>

      {/* Subject Performance Breakdown Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-semibold">
          <span>Subject-Wise Performance & CBC Rubric Distribution</span>
          <div className="flex items-center gap-3">
            <span className="text-emerald-700">EE (80-100%)</span>
            <span className="text-sky-700">ME (65-79%)</span>
            <span className="text-amber-700">AE (50-64%)</span>
            <span className="text-rose-700">BE (&lt;50%)</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Learning Area</th>
                <th className="p-3">Lead Educator</th>
                <th className="p-3 text-center">Candidates</th>
                <th className="p-3 text-center">Mean Score</th>
                <th className="p-3 text-center">Proficiency Rate</th>
                <th className="p-3">Rubric Breakdown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjectStats.map((subj) => (
                <tr key={subj.subjectId} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-900">
                    {subj.name}
                    <span className="block text-[10px] text-slate-500 font-mono">{subj.code}</span>
                  </td>
                  <td className="p-3 text-slate-600">{subj.leadTeacher}</td>
                  <td className="p-3 text-center font-bold tabular-nums text-slate-900">{subj.candidates}</td>
                  <td className="p-3 text-center font-bold text-emerald-800 tabular-nums">{subj.meanScore}%</td>
                  <td className="p-3 text-center font-bold text-sky-800 tabular-nums">{subj.proficiencyRate}%</td>
                  <td className="p-3 min-w-44">
                    <div className="w-full h-3 bg-slate-100 rounded-full flex overflow-hidden">
                      <div
                        style={{ width: `${(subj.ee / (subj.candidates || 1)) * 100}%` }}
                        className="bg-emerald-600 h-full"
                        title={`EE: ${subj.ee}`}
                      />
                      <div
                        style={{ width: `${(subj.me / (subj.candidates || 1)) * 100}%` }}
                        className="bg-sky-600 h-full"
                        title={`ME: ${subj.me}`}
                      />
                      <div
                        style={{ width: `${(subj.ae / (subj.candidates || 1)) * 100}%` }}
                        className="bg-amber-500 h-full"
                        title={`AE: ${subj.ae}`}
                      />
                      <div
                        style={{ width: `${(subj.be / (subj.candidates || 1)) * 100}%` }}
                        className="bg-rose-500 h-full"
                        title={`BE: ${subj.be}`}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>EE: {subj.ee}</span>
                      <span>ME: {subj.me}</span>
                      <span>AE: {subj.ae}</span>
                      <span>BE: {subj.be}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
