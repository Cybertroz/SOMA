/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  X,
  FileText,
  School,
  User,
  ShieldCheck,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { MoeTransferApproval } from '../types/school';

interface Props {
  transfer: MoeTransferApproval | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (transferId: string, reviewedBy: string) => void;
  onReject: (transferId: string, reason: string) => void;
  reviewerName: string;
}

export function MoeInlineTransferApprovalModal({
  transfer,
  isOpen,
  onClose,
  onApprove,
  onReject,
  reviewerName,
}: Props) {
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectMode, setIsRejectMode] = useState(false);

  if (!isOpen || !transfer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-slate-950">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Inter-School Transfer Authorization
              </h3>
              <p className="text-xs text-slate-500">
                NEMIS UPI slot release & capitation entitlement transfer
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transfer Dossier Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Learner Info Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-slate-500 uppercase tracking-wider">Learner Details</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                {transfer.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <strong className="text-sm font-black text-slate-900 dark:text-white block">
                  {transfer.learnerName}
                </strong>
                <span className="font-mono text-slate-600 dark:text-slate-400">
                  NEMIS UPI: <strong className="text-slate-900 dark:text-white">{transfer.nemisUpi}</strong> · {transfer.grade}
                </span>
              </div>
            </div>
          </div>

          {/* Transfer Route */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase font-bold block mb-1">Releasing School</span>
              <div className="font-bold text-slate-900 dark:text-white">{transfer.fromSchool}</div>
              <span className="text-[11px] text-slate-500">Clearance Slip Verified</span>
            </div>

            <div className="p-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
              <span className="text-[11px] text-emerald-800 dark:text-emerald-400 uppercase font-bold block mb-1">Admitting School</span>
              <div className="font-bold text-slate-900 dark:text-white">{transfer.toSchool}</div>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400">NEMIS Slot Reserved</span>
            </div>
          </div>

          {/* Justification & Attachments */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="text-[11px] text-slate-400 uppercase font-bold block">Transfer Grounds</span>
            <p className="text-slate-800 dark:text-slate-200 font-medium">
              {transfer.reason || 'Parental relocation to Limuru Sub-County with certified employer transfer letter.'}
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
              <FileText className="w-3.5 h-3.5" />
              <span>Attached: Parent Transfer Letter & Clearance Certificate (.pdf)</span>
            </div>
          </div>

          {/* Reject Input */}
          {isRejectMode && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2 animate-in fade-in duration-100">
              <label className="block text-[11px] font-bold text-rose-900 dark:text-rose-200 uppercase">
                Statutory Reason for Rejection (Required)
              </label>
              <textarea
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="State statutory basis under Basic Education Regulations..."
                className="w-full p-2 text-xs rounded-lg border border-rose-300 dark:border-rose-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {!isRejectMode ? (
              <>
                <button
                  onClick={() => setIsRejectMode(true)}
                  className="px-3 py-1.5 rounded-lg text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors"
                >
                  Reject...
                </button>
                <button
                  onClick={() => {
                    onApprove(transfer.id, reviewerName);
                    onClose();
                  }}
                  className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Sync NEMIS</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsRejectMode(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Back
                </button>
                <button
                  disabled={!rejectReason.trim()}
                  onClick={() => {
                    if (rejectReason.trim()) {
                      onReject(transfer.id, rejectReason.trim());
                      onClose();
                    }
                  }}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Confirm Rejection</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
