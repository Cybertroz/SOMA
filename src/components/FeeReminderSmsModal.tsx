/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Send,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  DollarSign,
  User,
  Phone,
  Radio,
} from 'lucide-react';
import { Learner, SMSBroadcast } from '../types/school';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  learner: Learner | null;
  onSendInstantReminder: (broadcast: SMSBroadcast) => void;
  onOpenInBulkGateway: (draft: {
    targetGroup: 'All Grades' | 'Fee Defaulters';
    messageText: string;
    messageType: SMSBroadcast['type'];
    targetStudentName: string;
  }) => void;
  onLogAudit: (action: any, resource: string, details: string) => void;
}

export function FeeReminderSmsModal({
  isOpen,
  onClose,
  learner,
  onSendInstantReminder,
  onOpenInBulkGateway,
  onLogAudit,
}: Props) {
  if (!isOpen || !learner) return null;

  const defaultTemplate = `Dear ${learner.guardianName}, this is a reminder from Limuru Model Comprehensive School that ${learner.name} (Adm: ${learner.admissionNo}, Class: ${learner.stream}) has an outstanding Term 1 fee balance of KES ${learner.fees.balance.toLocaleString()}. Kindly remit via Safaricom Paybill 522123, Account: ${learner.admissionNo}. Inquiries: 0722000000. Thank you.`;

  const [message, setMessage] = useState(defaultTemplate);
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const charCount = message.length;
  const smsUnits = Math.ceil(charCount / 160) || 1;
  const estimatedCost = (smsUnits * 0.8).toFixed(2);

  const handleSendNow = () => {
    setIsSending(true);
    setSentSuccess(false);

    setTimeout(() => {
      const newBroadcast: SMSBroadcast = {
        id: `sms_${Date.now()}`,
        type: 'Fee Reminder',
        message: message.trim(),
        recipientsCount: 1,
        targetGrade: learner.grade,
        timestamp:
          new Date().toLocaleDateString('en-GB') +
          ' ' +
          new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        deliveryRate: 100,
        status: 'Delivered',
      };

      onSendInstantReminder(newBroadcast);

      onLogAudit(
        'FEE_REMINDER_SMS',
        `Safaricom SMS Gateway · ${learner.name} (${learner.admissionNo})`,
        `Dispatched fee balance reminder of KES ${learner.fees.balance.toLocaleString()} to parent phone ${learner.guardianPhone}.`
      );

      setIsSending(false);
      setSentSuccess(true);

      setTimeout(() => {
        setSentSuccess(false);
        onClose();
      }, 1400);
    }, 700);
  };

  const handleOpenBulkGateway = () => {
    onOpenInBulkGateway({
      targetGroup: 'Fee Defaulters',
      messageText: message,
      messageType: 'Fee Reminder',
      targetStudentName: `${learner.name} (${learner.admissionNo})`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center font-bold shadow-xs">
              <Smartphone className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Send Fee Arrears SMS Reminder
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold ${
                    learner.fees.status === 'Defaulter'
                      ? 'bg-rose-900/80 text-rose-200 border border-rose-700'
                      : 'bg-amber-900/80 text-amber-200 border border-amber-700'
                  }`}
                >
                  {learner.fees.status}
                </span>
              </h2>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                Target: {learner.name} · {learner.admissionNo} · {learner.stream}
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
        {sentSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 flex items-center gap-2 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>SMS reminder successfully dispatched to Safaricom SMS Gateway queue! Reference ID: SMS-DAR-{Date.now().toString().slice(-6)}</span>
          </div>
        )}

        <div className="p-6 space-y-5">
          {/* Recipient & Financial Summary Card */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Guardian Name</span>
                <strong className="text-slate-900 font-semibold">{learner.guardianName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Mobile Number</span>
                <strong className="text-slate-900 font-mono font-semibold">{learner.guardianPhone}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Outstanding Arrears</span>
                <strong className="text-rose-600 font-bold tabular-nums">
                  KES {learner.fees.balance.toLocaleString()}
                </strong>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
              <span>Term Fee: KES {learner.fees.totalTermFee.toLocaleString()}</span>
              <span>Paid: KES {learner.fees.paidAmount.toLocaleString()}</span>
              <span className="font-mono text-emerald-800 font-medium">Paybill: 522123 · Acc: {learner.admissionNo}</span>
            </div>
          </div>

          {/* Editable SMS Message Text */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                SMS Message Text (Pre-filled Template)
              </label>
              <div className="text-[11px] text-slate-500 font-mono">
                <span className={charCount > 160 ? 'text-amber-600 font-bold' : ''}>
                  {charCount} chars
                </span>{' '}
                · {smsUnits} {smsUnits === 1 ? 'Unit' : 'Units'} (Est. KES {estimatedCost})
              </div>
            </div>

            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden leading-relaxed"
              placeholder="Enter SMS text..."
            />
          </div>

          {/* Gateway Routing Notice */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-950 text-xs flex items-start gap-2.5">
            <Radio className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-[11px] space-y-0.5">
              <span className="font-bold">Safaricom Daraja & Africa&apos;s Talking Gateway</span>
              <p className="text-emerald-800">
                Authorized Sender ID: <strong>LIMURU-SCH</strong>. Live delivery receipt will be stamped with Kenya time and recorded in the Security Audit Ledger.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleOpenBulkGateway}
            className="w-full sm:w-auto px-4 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            Open in Full Bulk SMS Gateway
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSendNow}
              disabled={isSending || !message.trim()}
              className="w-full sm:w-auto px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isSending ? 'Sending to Safaricom...' : 'Send SMS Reminder Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
