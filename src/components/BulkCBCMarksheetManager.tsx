/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  X,
  Award,
} from 'lucide-react';
import { Learner, CBCLevel } from '../types/school';
import { ALL_LEARNING_AREAS } from '../data/mockSchoolData';
import { exportToExcel } from '../utils/excelExport';

interface Props {
  students: Learner[];
  onApplyMarks: (
    subjectId: string,
    updates: { studentId: string; summativeScore: number; formative: CBCLevel; remarks: string }[]
  ) => void;
  onClose: () => void;
}

export function BulkCBCMarksheetManager({ students, onApplyMarks, onClose }: Props) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('mat');
  const [parsedRows, setParsedRows] = useState<
    {
      rawName: string;
      matchedStudent?: Learner;
      score: number;
      level: CBCLevel;
      remarks: string;
      status: 'Matched' | 'Not Found';
    }[]
  >([]);
  const [fileName, setFileName] = useState<string>('');

  const currentSubject = ALL_LEARNING_AREAS.find((s) => s.id === selectedSubjectId) || ALL_LEARNING_AREAS[0];

  const scoreToLevel = (score: number): CBCLevel => {
    if (score >= 80) return 'EE';
    if (score >= 65) return 'ME';
    if (score >= 50) return 'AE';
    return 'BE';
  };

  const handleDownloadTemplate = () => {
    const rows = students.map((s) => ({
      name: s.name,
      admissionNo: s.admissionNo,
      grade: s.grade,
      stream: s.stream,
      subject: currentSubject.name,
      summativeScore: s.assessments[currentSubject.id]?.summativeScore || 70,
      teacherRemarks: s.assessments[currentSubject.id]?.remarks || 'Demonstrates good competence.',
    }));

    exportToExcel(
      `Limuru_Model_${currentSubject.code}_Marksheet_Template`,
      rows,
      [
        { header: 'Learner Name', key: 'name' },
        { header: 'Summative Score (0-100)', key: 'summativeScore' },
        { header: 'Teacher Remarks', key: 'teacherRemarks' },
        { header: 'Admission No', key: 'admissionNo' },
        { header: 'Grade', key: 'grade' },
        { header: 'Stream', key: 'stream' },
      ]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) return;

      const header = lines[0].split(/[,;\t]/).map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase());
      let nameIdx = header.findIndex((h) => h.includes('name'));
      let scoreIdx = header.findIndex((h) => h.includes('score') || h.includes('mark') || h.includes('percent'));
      let remarkIdx = header.findIndex((h) => h.includes('remark') || h.includes('note') || h.includes('comment'));

      if (nameIdx === -1) nameIdx = 0;
      if (scoreIdx === -1) scoreIdx = 1;
      if (remarkIdx === -1) remarkIdx = 2;

      const parsed: typeof parsedRows = [];

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(/[,;\t]/).map((c) => c.replace(/^["']|["']$/g, '').trim());
        if (parts.length >= 2 && parts[nameIdx]) {
          const rawName = parts[nameIdx];
          const rawScore = Math.min(100, Math.max(0, Number(parts[scoreIdx]) || 0));
          const remarks = parts[remarkIdx] || 'Standard milestone achieved.';

          // Match student by name
          const matched = students.find((s) => {
            const sn = s.name.toLowerCase();
            const rn = rawName.toLowerCase();
            if (sn === rn) return true;
            const snTokens = sn.split(/\s+/);
            const rnTokens = rn.split(/\s+/);
            return snTokens.filter((t) => rnTokens.includes(t)).length >= 2;
          });

          parsed.push({
            rawName,
            matchedStudent: matched,
            score: rawScore,
            level: scoreToLevel(rawScore),
            remarks,
            status: matched ? 'Matched' : 'Not Found',
          });
        }
      }

      setParsedRows(parsed);
    };

    reader.readAsText(file);
  };

  const handleApply = () => {
    const valid = parsedRows.filter((r) => r.matchedStudent);
    if (valid.length === 0) return;

    const updates = valid.map((r) => ({
      studentId: r.matchedStudent!.id,
      summativeScore: r.score,
      formative: r.level,
      remarks: r.remarks,
    }));

    onApplyMarks(selectedSubjectId, updates);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 sm:p-7 border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Bulk CBC Marksheet Excel Upload & Assessment Sync
              </h3>
              <p className="text-xs text-slate-500">
                Limuru Model School · Upload continuous assessment marks and auto-generate KNEC rubric levels
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-xs">
          {/* Learning Area Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <span className="font-semibold text-slate-700 block mb-1">Target Learning Area:</span>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="bg-white border border-slate-300 rounded px-3 py-1.5 font-bold text-emerald-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {ALL_LEARNING_AREAS.map((subj) => (
                  <option key={subj.id} value={subj.id}>
                    {subj.name} ({subj.code}) · {subj.leadTeacher}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2 bg-white border border-emerald-600 text-emerald-800 hover:bg-emerald-50 rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              Download Marksheet Template (.csv)
            </button>
          </div>

          {/* Upload input */}
          <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg text-center space-y-2">
            <p className="text-slate-600">
              Upload filled spreadsheet with columns: <strong>Learner Name</strong>, <strong>Summative Score (0-100)</strong>, <strong>Teacher Remarks</strong>
            </p>
            <div>
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold text-xs transition-colors shadow-xs">
                <Upload className="w-4 h-4" />
                Select Excel / CSV Marksheet
                <input
                  type="file"
                  accept=".csv,.txt,.tsv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            {fileName && (
              <span className="text-slate-600 font-mono text-[11px] block">
                {fileName} ({parsedRows.length} rows parsed)
              </span>
            )}
          </div>

          {/* Preview rows */}
          {parsedRows.length > 0 && (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between font-semibold">
                <span>Parsed Scores ({parsedRows.filter((r) => r.status === 'Matched').length} matched to enrolled learners):</span>
                <button
                  onClick={handleApply}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold shadow-xs"
                >
                  Commit & Update All Scores
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                    <tr>
                      <th className="p-2">Learner Name</th>
                      <th className="p-2">Admission No</th>
                      <th className="p-2 text-center">Score</th>
                      <th className="p-2 text-center">Rubric Level</th>
                      <th className="p-2">Remarks</th>
                      <th className="p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className={row.status === 'Matched' ? '' : 'bg-rose-50/50'}>
                        <td className="p-2 font-semibold text-slate-900">{row.rawName}</td>
                        <td className="p-2 font-mono text-slate-600">{row.matchedStudent?.admissionNo || '—'}</td>
                        <td className="p-2 text-center font-bold text-slate-900 tabular-nums">{row.score}%</td>
                        <td className="p-2 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              row.level === 'EE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : row.level === 'ME'
                                ? 'bg-sky-100 text-sky-800'
                                : row.level === 'AE'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {row.level}
                          </span>
                        </td>
                        <td className="p-2 text-slate-600 truncate max-w-xs">{row.remarks}</td>
                        <td className="p-2 text-center">
                          {row.status === 'Matched' ? (
                            <span className="text-emerald-700 font-semibold flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Matched
                            </span>
                          ) : (
                            <span className="text-rose-600 font-semibold flex items-center justify-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> Not Found
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
