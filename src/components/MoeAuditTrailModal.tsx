/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Filter,
  X,
  FileText,
} from 'lucide-react';

export interface MoeAuditEntry {
  id: string;
  timestamp: string;
  action: 'FREEZE' | 'UNFREEZE' | 'TRANSFER_APPROVAL' | 'TRANSFER_REJECTION' | 'CAPITATION_RELEASE';
  targetSchool: string;
  centerCode: string;
  performedBy: string;
  role: string;
  reason: string;
}

export const INITIAL_MOE_AUDIT_TRAIL: MoeAuditEntry[] = [
  {
    id: 'aud_m_01',
    timestamp: '2026-10-28 14:22:10',
    action: 'TRANSFER_APPROVAL',
    targetSchool: 'Limuru Model Comprehensive School',
    centerCode: '20401823',
    performedBy: 'Dr. Belio Kipsang, CBS',
    role: 'County Director / Principal Secretary',
    reason: 'Approved incoming transfer of Kelvin Kiprop Langat from Kaptagat Model (NEMIS slot updated).',
  },
  {
    id: 'aud_m_02',
    timestamp: '2026-10-25 11:05:40',
    action: 'FREEZE',
    targetSchool: 'Ruiru Elite Academy & Junior School',
    centerCode: '20401662',
    performedBy: 'Dr. Belio Kipsang, CBS',
    role: 'County Director',
    reason: 'Unauthorized secondary levies: Charging KES 14,000 extra tuition without County Education Board approval.',
  },
  {
    id: 'aud_m_03',
    timestamp: '2026-10-22 09:40:15',
    action: 'CAPITATION_RELEASE',
    targetSchool: 'Limuru Model Comprehensive School',
    centerCode: '20401823',
    performedBy: 'Dr. Belio Kipsang, CBS',
    role: 'Director of Basic Education',
    reason: 'Authorized Term 1 FPE/FDJSE capitation warrant of KES 4,425,620 upon 100% KEMIS headcount verification.',
  },
  {
    id: 'aud_m_04',
    timestamp: '2026-10-18 16:15:30',
    action: 'TRANSFER_REJECTION',
    targetSchool: 'Thika High School',
    centerCode: '20400512',
    performedBy: 'Dr. Belio Kipsang, CBS',
    role: 'County Director',
    reason: 'Rejected transfer request: Target school stream at statutory class capacity (45/45 learners).',
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  auditEntries?: MoeAuditEntry[];
}

export function MoeAuditTrailModal({
  isOpen,
  onClose,
  auditEntries = INITIAL_MOE_AUDIT_TRAIL,
}: Props) {
  const [filterAction, setFilterAction] = useState<string>('All');

  if (!isOpen) return null;

  const filtered = auditEntries.filter((e) => {
    if (filterAction === 'All') return true;
    return e.action === filterAction;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Statutory Oversight & Enforcement Audit Trail
              </h3>
              <p className="text-xs text-slate-500">
                Immutable record of institutional freezes, sanctions, and ministerial approvals
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-500 uppercase text-[11px]">Filter Action:</span>
          {(['All', 'FREEZE', 'TRANSFER_APPROVAL', 'CAPITATION_RELEASE'] as const).map((act) => (
            <button
              key={act}
              onClick={() => setFilterAction(act)}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                filterAction === act
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {act.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Trail Items */}
        <div className="p-4 overflow-y-auto space-y-3">
          {filtered.map((item) => {
            const isFreeze = item.action === 'FREEZE';
            const isApproval = item.action === 'TRANSFER_APPROVAL' || item.action === 'CAPITATION_RELEASE';

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all ${
                  isFreeze
                    ? 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900'
                    : isApproval
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider ${
                      isFreeze ? 'bg-rose-600 text-white' : 'bg-emerald-700 text-white'
                    }`}>
                      {item.action.replace('_', ' ')}
                    </span>
                    <strong className="text-slate-900 dark:text-white font-bold">{item.targetSchool}</strong>
                    <span className="font-mono text-slate-400">({item.centerCode})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{item.timestamp}</span>
                  </div>
                </div>

                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  {item.reason}
                </p>

                <div className="pt-1 text-[11px] text-slate-500 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Enforced by: <strong className="text-slate-900 dark:text-white">{item.performedBy}</strong> ({item.role})</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs"
          >
            Close Audit Ledger
          </button>
        </div>
      </div>
    </div>
  );
}
