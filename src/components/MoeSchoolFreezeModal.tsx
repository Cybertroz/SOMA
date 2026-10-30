/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Lock,
  X,
  FileText,
} from 'lucide-react';
import { KiambuSchoolRecord } from '../types/school';

interface Props {
  school: KiambuSchoolRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmFreeze: (school: KiambuSchoolRecord, reason: string, category: string) => void;
  officerName: string;
}

const STATUTORY_REASONS = [
  'Unauthorized Secondary Levies / Illegal PTA Fee Assessment',
  'Failure to Separate PS and JS Bank Accounts & Suffixes',
  'Severe Sanitation & Safety Standard Infractions (Fire/Dorms)',
  'Unverified Learner Headcount / Discrepancy with KEMIS Census',
  'KNEC Assessment Examination Irregularity Investigation',
  'Non-Compliance with Teacher Workload Guidelines (TSC Gap)',
];

export function MoeSchoolFreezeModal({
  school,
  isOpen,
  onClose,
  onConfirmFreeze,
  officerName,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState(STATUTORY_REASONS[0]);
  const [detailedNotes, setDetailedNotes] = useState('');
  const [confirmedCheck, setConfirmedCheck] = useState(false);

  if (!isOpen || !school) return null;

  const handleConfirm = () => {
    if (!confirmedCheck) return;
    const finalReason = `${selectedCategory}: ${detailedNotes.trim() || 'Formal statutory freeze gazetted.'}`;
    onConfirmFreeze(school, finalReason, selectedCategory);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-rose-200 dark:border-rose-900 z-10 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-rose-100 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-600 text-white shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-rose-950 dark:text-rose-200">
                Freeze Institutional Operations
              </h3>
              <p className="text-xs text-rose-800 dark:text-rose-400">
                Statutory sanction under Basic Education Act (No. 14 of 2013)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Target School Badge */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-mono text-[11px] uppercase">Target Institution</span>
              <span className="font-mono text-slate-900 dark:text-white font-bold">{school.centerCode}</span>
            </div>
            <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
              {school.name}
            </div>
            <div className="text-slate-500 mt-0.5">
              {school.subCounty} Sub-County · Principal: {school.principalName}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Statutory Impact:</strong> Freezing freezes all capitation disbursements, suspends student transfers, and locks examination registration until cleared by the County Directorate.
            </p>
          </div>

          {/* Statutory Category Dropdown */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Statutory Ground for Action (Required)
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs"
            >
              {STATUTORY_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Detailed Justification */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Official Justification & Auditor Reference
            </label>
            <textarea
              rows={3}
              value={detailedNotes}
              onChange={(e) => setDetailedNotes(e.target.value)}
              placeholder="Cite inspection return number, date of notice, and directives violated..."
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
            />
          </div>

          {/* Officer Confirmation Checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={confirmedCheck}
              onChange={(e) => setConfirmedCheck(e.target.checked)}
              className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              I, <strong>{officerName}</strong>, hereby certify this statutory enforcement action complies with Ministry of Education regulations and will be logged in the permanent audit ledger.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            disabled={!confirmedCheck}
            onClick={handleConfirm}
            className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Confirm & Enforce Freeze</span>
          </button>
        </div>
      </div>
    </div>
  );
}
