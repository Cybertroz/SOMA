/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert, Lock, ArrowLeft, Users, RefreshCw } from 'lucide-react';
import { AuthUser, UserRole } from '../types/school';
import { ROLE_CONFIGS, SYSTEM_USERS } from '../data/mockUsers';

interface UnauthorizedAccessGuardProps {
  currentUser: AuthUser;
  attemptedModule: string;
  onGoBack: () => void;
  onSelectUser: (user: AuthUser) => void;
}

export const UnauthorizedAccessGuard: React.FC<UnauthorizedAccessGuardProps> = ({
  currentUser,
  attemptedModule,
  onGoBack,
  onSelectUser,
}) => {
  const principalUser = SYSTEM_USERS.find((u) => u.role === 'principal') || SYSTEM_USERS[0];
  const roleConfig = ROLE_CONFIGS[currentUser.role];

  return (
    <div className="max-w-2xl mx-auto my-12 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      <div className="bg-rose-900 text-white p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-rose-800/80 border border-rose-700 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-6 h-6 text-rose-300" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Access Restricted — Operational Safeguard</h2>
          <p className="text-xs text-rose-200">
            Kenya Data Protection Act 2019 & Institutional Role-Based Access Control
          </p>
        </div>
      </div>

      <div className="p-6 space-y-5 text-xs">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Attempted Module:</span>
            <strong className="font-mono text-slate-900 capitalize">
              {attemptedModule.replace('-', ' ')}
            </strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Current Authenticated Role:</span>
            <span className="px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-200">
              {currentUser.role.replace('_', ' ')} ({currentUser.name})
            </span>
          </div>
        </div>

        <div className="text-slate-700 leading-relaxed space-y-2">
          <p>
            Your current assigned role (<strong>{roleConfig.title}</strong>) does not possess write or inspection clearance for the <strong className="capitalize">{attemptedModule.replace('-', ' ')}</strong> module.
          </p>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900">
            <strong>Data Protection Safeguard: </strong>
            {roleConfig.dataSafeguardNotice}
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onGoBack}
            className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Authorized Dashboard
          </button>

          <button
            onClick={() => onSelectUser(principalUser)}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-emerald-700" />
            Switch to Principal (Super Admin)
          </button>
        </div>
      </div>
    </div>
  );
};
