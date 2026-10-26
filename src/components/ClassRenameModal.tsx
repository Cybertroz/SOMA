/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  School,
  Edit2,
  Check,
  Plus,
  Users,
  Sparkles,
  AlertCircle,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { GradeLevel, Learner, TeacherStaffRecord } from '../types/school';
import { ALL_GRADES } from '../data/mockSchoolData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  learners: Learner[];
  teachers: TeacherStaffRecord[];
  onRenameStream: (oldStreamName: string, newStreamName: string, grade: GradeLevel) => void;
  onAddNewStream: (grade: GradeLevel, streamName: string) => void;
  onLogAudit: (action: any, resource: string, details: string) => void;
}

export function ClassRenameModal({
  isOpen,
  onClose,
  learners,
  teachers,
  onRenameStream,
  onAddNewStream,
  onLogAudit,
}: Props) {
  // Extract all unique streams grouped by grade
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('Grade 7');
  const [editingStream, setEditingStream] = useState<string | null>(null);
  const [newStreamInput, setNewStreamInput] = useState<string>('');
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [brandNewStreamName, setBrandNewStreamName] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Find streams in selected grade
  const gradeStudents = learners.filter((s) => s.grade === selectedGrade);
  const distinctStreams = Array.from(new Set(gradeStudents.map((s) => s.stream)));

  // Fallback if no streams yet in this grade
  const displayStreams = distinctStreams.length > 0 
    ? distinctStreams 
    : [`${selectedGrade.replace('Grade ', '')} Acacia`];

  const handleStartRename = (currentStream: string) => {
    setEditingStream(currentStream);
    setNewStreamInput(currentStream);
  };

  const handleSaveRename = (oldStream: string) => {
    const trimmed = newStreamInput.trim();
    if (!trimmed || trimmed === oldStream) {
      setEditingStream(null);
      return;
    }

    onRenameStream(oldStream, trimmed, selectedGrade);
    onLogAudit(
      'CLASS_STREAM_RENAMED',
      `Class & Stream Registry · ${selectedGrade}`,
      `Renamed stream from "${oldStream}" to "${trimmed}" across ${gradeStudents.filter(s => s.stream === oldStream).length} enrolled learners.`
    );

    setEditingStream(null);
    setSuccessMessage(`Successfully renamed class stream to "${trimmed}"!`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleCreateNewStream = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = brandNewStreamName.trim();
    if (!trimmed) return;

    onAddNewStream(selectedGrade, trimmed);
    onLogAudit(
      'CLASS_STREAM_RENAMED',
      `Class & Stream Registry · ${selectedGrade}`,
      `Created new stream "${trimmed}" under ${selectedGrade}.`
    );

    setBrandNewStreamName('');
    setIsAddingNew(false);
    setSuccessMessage(`Added new stream "${trimmed}" to ${selectedGrade}!`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-bold shadow-xs">
              <School className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Class & Stream Nomenclature Manager
                <span className="text-[10px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded font-mono uppercase">
                  Grades 1–9
                </span>
              </h2>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                Rename classes and custom streams (e.g. Amboseli, Mara, Red, East) with live student ledger updates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center gap-2 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Grade Selector Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Grade Level to Configure
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5">
              {ALL_GRADES.map((grade) => {
                const count = learners.filter((s) => s.grade === grade).length;
                const isSelected = selectedGrade === grade;
                return (
                  <button
                    key={grade}
                    onClick={() => {
                      setSelectedGrade(grade);
                      setEditingStream(null);
                      setIsAddingNew(false);
                    }}
                    className={`py-2 px-1 text-center rounded-lg border text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs ring-2 ring-emerald-600/30'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="block truncate">{grade.replace('Grade ', 'G')}</span>
                    <span className={`text-[10px] block font-normal ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>
                      {count} std
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Streams Table */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedGrade} Active Streams & Classes
                </h3>
                <p className="text-xs text-slate-500">
                  Total learners in {selectedGrade}: {gradeStudents.length} students
                </p>
              </div>

              {!isAddingNew && (
                <button
                  onClick={() => setIsAddingNew(true)}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add New Stream
                </button>
              )}
            </div>

            {/* Add New Stream Form */}
            {isAddingNew && (
              <form onSubmit={handleCreateNewStream} className="p-3 bg-white rounded-lg border border-emerald-300 shadow-xs space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  New Stream Name for {selectedGrade}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder={`e.g. ${selectedGrade.replace('Grade ', '')} Tsavo or ${selectedGrade} Blue`}
                    value={brandNewStreamName}
                    onChange={(e) => setBrandNewStreamName(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Stream List */}
            <div className="space-y-2">
              {displayStreams.map((stream) => {
                const streamLearners = gradeStudents.filter((s) => s.stream === stream);
                const assignedTeacher = teachers.find(
                  (t) => t.assignedStream === stream || (t.assignedGrade === selectedGrade && t.role === 'Class Master')
                );
                const isEditing = editingStream === stream;

                return (
                  <div
                    key={stream}
                    className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newStreamInput}
                            onChange={(e) => setNewStreamInput(e.target.value)}
                            className="px-2.5 py-1 text-xs border border-emerald-500 rounded-md font-bold text-slate-900 focus:outline-hidden ring-1 ring-emerald-500 w-full max-w-xs"
                            placeholder="Enter new stream name..."
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveRename(stream)}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded flex items-center gap-1 shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" /> Save
                          </button>
                          <button
                            onClick={() => setEditingStream(null)}
                            className="px-2 py-1 border border-slate-200 text-slate-600 text-xs rounded hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-bold text-slate-900">{stream}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200 flex items-center gap-1">
                            <Users className="w-3 h-3 text-emerald-700" />
                            {streamLearners.length} Enrolled
                          </span>
                        </div>
                      )}

                      <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                        <span>
                          Class Teacher: <strong className="text-slate-800">{assignedTeacher ? assignedTeacher.name : 'Unallocated'}</strong>
                        </span>
                        <span>·</span>
                        <span className="text-emerald-700 font-medium">Standard CBC Capacity: 45 Learners</span>
                      </div>
                    </div>

                    {!isEditing && (
                      <button
                        onClick={() => handleStartRename(stream)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                        Rename Class Stream
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Naming Conventions Tip */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">MoE & Kenya CBC Class Naming Guide</span>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                You can adopt Kenyan Geographical (e.g. <em>7 Amboseli, 8 Mara, 9 Turkana</em>), Cardinal (e.g. <em>Grade 7 East, Grade 7 West</em>), or Color Themes (e.g. <em>Grade 1 Blue, Grade 1 Red</em>). Renaming automatically synchronizes all students' report cards, fee statements, attendance registers, and CBC marksheets.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Changes are saved to persistent school storage immediately.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Close Manager
          </button>
        </div>
      </div>
    </div>
  );
}
