/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Award,
  CheckCircle2,
  X,
  Save,
  Filter,
  Users,
  Check,
} from 'lucide-react';
import { Learner, GradeLevel } from '../types/school';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  learners: Learner[];
  onSaveAssessment: (updatedLearners: Learner[]) => void;
}

const LEARNING_AREAS = [
  { id: 'mat', name: 'Mathematics & Numeracy', strands: ['Number Concepts', 'Algebraic Logic', 'Measurements', 'Geometry & Data'] },
  { id: 'eng', name: 'English Language', strands: ['Listening & Speaking', 'Reading Fluency', 'Grammar & Syntax', 'Creative Writing'] },
  { id: 'kis', name: 'Kiswahili', strands: ['Kusikiliza na Kuongea', 'Kusoma kwa Ufahamu', 'Sarufi', 'Uandishi wa Insha'] },
  { id: 'sci', name: 'Science & Technology', strands: ['Living Organisms', 'Physical Science', 'Digital Literacy', 'Energy & Apparatus'] },
  { id: 'agr', name: 'Agriculture & Nutrition', strands: ['Crop Husbandry', 'Soil Conservation', 'Animal Production', 'Kitchen Gardening'] },
  { id: 'pre_tech', name: 'Pre-Technical Studies', strands: ['Safety & Tools', 'Materials Science', 'Technical Drawing', 'Electrical Circuits'] },
  { id: 'soc', name: 'Social Studies', strands: ['Devolution & Governance', 'Historical Heritage', 'Physical Geography', 'African Unity'] },
  { id: 'cre_ire', name: 'Religious Education (CRE/IRE)', strands: ['Values & Ethics', 'Moral Discernment', 'Scriptural Studies'] },
  { id: 'arts_sports', name: 'Creative Arts & Sports', strands: ['Visual Arts', 'Performing Arts / Music', 'Physical Fitness & Athletics'] },
];

export function CbcQuickAssessmentModal({
  isOpen,
  onClose,
  learners,
  onSaveAssessment,
}: Props) {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('Grade 7');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('mat');
  const [selectedStrand, setSelectedStrand] = useState<string>('Algebraic Logic');
  const [assessmentType, setAssessmentType] = useState<'Formative' | 'Summative'>('Formative');

  // Local state of marks entered: { [learnerId]: { level: 'EE' | 'ME' | 'AE' | 'BE', score: number, remarks: string } }
  const [marksState, setMarksState] = useState<Record<string, { level: 'EE' | 'ME' | 'AE' | 'BE'; score: number; remarks: string }>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Filter learners by selected grade
  const gradeLearners = useMemo(() => {
    return learners.filter((l) => l.grade === selectedGrade);
  }, [learners, selectedGrade]);

  const activeSubject = useMemo(() => {
    return LEARNING_AREAS.find((s) => s.id === selectedSubjectId) || LEARNING_AREAS[0];
  }, [selectedSubjectId]);

  const handleSetLevel = (learnerId: string, level: 'EE' | 'ME' | 'AE' | 'BE') => {
    const defaultScore = level === 'EE' ? 88 : level === 'ME' ? 74 : level === 'AE' ? 58 : 42;
    setMarksState((prev) => ({
      ...prev,
      [learnerId]: {
        level,
        score: prev[learnerId]?.score || defaultScore,
        remarks: prev[learnerId]?.remarks || (level === 'EE' ? 'Exceeds expectation.' : level === 'ME' ? 'Meets expectation.' : 'Needs support.'),
      },
    }));
  };

  const handleBatchAllME = () => {
    const updated: Record<string, { level: 'EE' | 'ME' | 'AE' | 'BE'; score: number; remarks: string }> = {};
    gradeLearners.forEach((l) => {
      updated[l.id] = {
        level: 'ME',
        score: 75,
        remarks: 'Meets expectation in core learning area strands.',
      };
    });
    setMarksState(updated);
  };

  const handleSave = () => {
    const updatedLearners = learners.map((l) => {
      const entry = marksState[l.id];
      if (!entry) return l;

      return {
        ...l,
        assessments: {
          ...l.assessments,
          [selectedSubjectId]: {
            formative: entry.level,
            summativeScore: entry.score,
            level: entry.level,
            remarks: entry.remarks,
          },
        },
      };
    });

    onSaveAssessment(updatedLearners);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] z-10 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600 text-white">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Quick CBC Assessment Entry
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Record formative assessment rubrics (EE / ME / AE / BE) directly to pupil records
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Strip */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          {/* Grade Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Grade Tier
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value as GradeLevel);
                setMarksState({});
              }}
              className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
            >
              {(['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'] as GradeLevel[]).map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Subject / Learning Area */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Learning Area
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                const subj = LEARNING_AREAS.find((s) => s.id === e.target.value);
                if (subj && subj.strands[0]) setSelectedStrand(subj.strands[0]);
              }}
              className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
            >
              {LEARNING_AREAS.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Sub-strand */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Strand / Sub-strand
            </label>
            <select
              value={selectedStrand}
              onChange={(e) => setSelectedStrand(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
            >
              {activeSubject.strands.map((str) => (
                <option key={str} value={str}>{str}</option>
              ))}
            </select>
          </div>

          {/* Assessment Mode */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Assessment Type
            </label>
            <div className="flex rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden">
              <button
                type="button"
                onClick={() => setAssessmentType('Formative')}
                className={`flex-1 py-1.5 font-bold ${assessmentType === 'Formative' ? 'bg-emerald-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
              >
                Formative
              </button>
              <button
                type="button"
                onClick={() => setAssessmentType('Summative')}
                className={`flex-1 py-1.5 font-bold ${assessmentType === 'Summative' ? 'bg-emerald-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
              >
                Summative
              </button>
            </div>
          </div>
        </div>

        {/* Quick Batch Actions */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-600 dark:text-slate-400">
            Showing {gradeLearners.length} learners enrolled in {selectedGrade}
          </span>
          <button
            onClick={handleBatchAllME}
            className="px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 rounded-md border border-emerald-300 dark:border-emerald-800 transition-colors"
          >
            Auto-fill all with ME (Meeting Expectations)
          </button>
        </div>

        {/* Learners Table with Rubric Buttons */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-3">Learner Name & Adm</th>
                  <th className="p-3">Stream</th>
                  <th className="p-3 text-center">Rubric Level (EE / ME / AE / BE)</th>
                  <th className="p-3">Teacher Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {gradeLearners.slice(0, 30).map((l) => {
                  const entry = marksState[l.id];
                  const currentLevel = entry?.level || l.assessments[selectedSubjectId]?.level || 'ME';

                  return (
                    <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3">
                        <strong className="text-slate-900 dark:text-white block">{l.name}</strong>
                        <span className="font-mono text-[11px] text-slate-500">{l.admissionNo} · {l.gender}</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-600 dark:text-slate-400">
                        {l.stream}
                      </td>
                      <td className="p-3 text-center">
                        <div className="inline-flex rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden shadow-2xs">
                          {(['EE', 'ME', 'AE', 'BE'] as const).map((lvl) => {
                            const isLvlSelected = currentLevel === lvl;
                            const colorClass =
                              lvl === 'EE'
                                ? 'bg-emerald-600 text-white'
                                : lvl === 'ME'
                                ? 'bg-teal-600 text-white'
                                : lvl === 'AE'
                                ? 'bg-amber-500 text-white'
                                : 'bg-rose-600 text-white';

                            return (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => handleSetLevel(l.id, lvl)}
                                className={`px-3 py-1.5 font-black text-xs transition-colors ${
                                  isLvlSelected
                                    ? colorClass
                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                                title={`${lvl} - ${lvl === 'EE' ? 'Exceeding' : lvl === 'ME' ? 'Meeting' : lvl === 'AE' ? 'Approaching' : 'Below'}`}
                              >
                                {lvl}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          placeholder="Optional formative observation..."
                          value={entry?.remarks || ''}
                          onChange={(e) => {
                            const txt = e.target.value;
                            setMarksState((prev) => ({
                              ...prev,
                              [l.id]: {
                                level: currentLevel,
                                score: prev[l.id]?.score || 75,
                                remarks: txt,
                              },
                            }));
                          }}
                          className="w-full p-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between">
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {savedSuccess ? (
              <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Assessment marks saved and synced to learner profiles!
              </span>
            ) : (
              <span>Scores are logged against KNEC CBC Continuous Assessment Record</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save & Sync Assessments</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
