/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  KeyRound,
  ShieldCheck,
  UserCheck,
  Plus,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
  RefreshCw,
  X,
  Check,
  Layers,
  Settings,
  ShieldAlert,
  Building2,
  Trash2,
} from 'lucide-react';
import {
  MoeSigningOfficer,
  MoeAuthorityLevel,
  AuthUser,
} from '../types/school';

interface Props {
  currentUser: AuthUser;
  officers: MoeSigningOfficer[];
  onAddOfficer: (officer: MoeSigningOfficer) => void;
  onUpdateOfficerPin: (officerId: string, newPin: string) => void;
  onToggleOfficerStatus: (officerId: string) => void;
  onLogAudit: (action: any, resource: string, details: string, sensitivity?: any) => void;
}

export function MoeSigningSettingsView({
  currentUser,
  officers,
  onAddOfficer,
  onUpdateOfficerPin,
  onToggleOfficerStatus,
  onLogAudit,
}: Props) {
  const [isAddOfficerModalOpen, setIsAddOfficerModalOpen] = useState(false);
  const [selectedOfficerForPinUpdate, setSelectedOfficerForPinUpdate] = useState<MoeSigningOfficer | null>(null);
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinUpdateError, setPinUpdateError] = useState<string | null>(null);

  // New Officer Form State
  const [newOfficerName, setNewOfficerName] = useState('');
  const [newOfficerNationalId, setNewOfficerNationalId] = useState('');
  const [newOfficerBadge, setNewOfficerBadge] = useState('');
  const [newOfficerDesignation, setNewOfficerDesignation] = useState('');
  const [newOfficerLevel, setNewOfficerLevel] = useState<MoeAuthorityLevel>('Level 2: Sub-County Director of Education (SCDE)');
  const [newOfficerSubCounty, setNewOfficerSubCounty] = useState('Limuru');
  const [newOfficerPin, setNewOfficerPin] = useState('');
  const [newOfficerMaxLimit, setNewOfficerMaxLimit] = useState<number>(25000000);
  const [canApproveTransfers, setCanApproveTransfers] = useState(true);
  const [canDisburseFunds, setCanDisburseFunds] = useState(false);
  const [canGazetteSchools, setCanGazetteSchools] = useState(false);
  const [canFreezeAudit, setCanFreezeAudit] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Signature Testing Playground State
  const [testOfficerId, setTestOfficerId] = useState(officers[0]?.id || '');
  const [testPinInput, setTestPinInput] = useState('');
  const [testActionType, setTestActionType] = useState<'Transfer Clearance' | 'Capitation Warrant' | 'Institutional Charter'>('Transfer Clearance');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; certSeal?: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfficerName.trim() || !newOfficerBadge.trim() || !newOfficerPin.trim()) {
      setFormError('Please fill in official name, badge number, and signing password/PIN.');
      return;
    }
    if (newOfficerPin.length < 4) {
      setFormError('Signing password/PIN must be at least 4 characters/digits.');
      return;
    }

    // Generate SHA-256 fingerprint simulation
    const randomHex = Array.from({ length: 8 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':');
    const certFingerprint = `SHA256:7B:${randomHex.toUpperCase()}`;

    const newOfficer: MoeSigningOfficer = {
      id: `off_${Date.now()}`,
      name: newOfficerName.trim(),
      nationalId: newOfficerNationalId.trim() || '20941822',
      badgeNumber: newOfficerBadge.trim(),
      designation: newOfficerDesignation.trim() || newOfficerLevel.split(':')[1]?.trim() || 'Education Officer',
      level: newOfficerLevel,
      subCounty: newOfficerSubCounty,
      signingPin: newOfficerPin.trim(),
      certificateFingerprint: certFingerprint,
      maxCapitationApprovalKes: Number(newOfficerMaxLimit),
      canApproveTransfers,
      canDisburseFunds,
      canGazetteSchools,
      canFreezeAudit,
      status: 'Active Authorized',
      lastSigningTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    onAddOfficer(newOfficer);
    onLogAudit(
      'MOE_INSPECTION_AUDIT',
      `MoE Signing Authority Created: ${newOfficer.name} (${newOfficer.badgeNumber})`,
      `Registered Signing Officer Level: ${newOfficer.level}. Max Capitation Authority: KES ${newOfficer.maxCapitationApprovalKes.toLocaleString()}. Sub-County: ${newOfficer.subCounty}.`,
      'Restricted'
    );

    // Reset Form
    setNewOfficerName('');
    setNewOfficerBadge('');
    setNewOfficerPin('');
    setFormError(null);
    setIsAddOfficerModalOpen(false);
    showToast(`Signing Officer ${newOfficer.name} registered with ${newOfficer.level}.`);
  };

  const handleUpdatePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfficerForPinUpdate) return;
    if (newPinInput.length < 4) {
      setPinUpdateError('Signing Password/PIN must be at least 4 characters or digits.');
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setPinUpdateError('Password/PIN confirmation does not match.');
      return;
    }

    onUpdateOfficerPin(selectedOfficerForPinUpdate.id, newPinInput);
    onLogAudit(
      'MOE_INSPECTION_AUDIT',
      `MoE Signing Credential Reset: ${selectedOfficerForPinUpdate.name}`,
      `Updated cryptographic signing password/PIN for badge ${selectedOfficerForPinUpdate.badgeNumber}.`,
      'Restricted'
    );

    setSelectedOfficerForPinUpdate(null);
    setNewPinInput('');
    setConfirmPinInput('');
    setPinUpdateError(null);
    showToast(`Signing password updated for ${selectedOfficerForPinUpdate.name}.`);
  };

  const handleRunSignatureTest = () => {
    const officer = officers.find((o) => o.id === testOfficerId);
    if (!officer) {
      setTestResult({ success: false, message: 'Officer not found.' });
      return;
    }

    if (testPinInput.trim() !== officer.signingPin) {
      setTestResult({
        success: false,
        message: `Authentication Failed: Incorrect Signing Password/PIN entered for ${officer.name}.`,
      });
      return;
    }

    // Check authority against action
    if (testActionType === 'Capitation Warrant' && !officer.canDisburseFunds) {
      setTestResult({
        success: false,
        message: `Privilege Error: ${officer.level} does NOT possess statutory mandate to disburse Treasury funds.`,
      });
      return;
    }

    if (testActionType === 'Institutional Charter' && !officer.canGazetteSchools) {
      setTestResult({
        success: false,
        message: `Privilege Error: ${officer.level} does NOT possess mandate to gazette school charters (requires Level 3 CDE or higher).`,
      });
      return;
    }

    const testSeal = `PKI-SEAL-${Math.floor(100000 + Math.random() * 900000)}-VALIDATED-SHA256`;
    setTestResult({
      success: true,
      message: `Signature Verified & Legally Valid! Officer ${officer.name} (${officer.level}) successfully authenticated with authorized clearance.`,
      certSeal: testSeal,
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-xl shadow-xl border border-emerald-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white p-6 rounded-2xl border border-amber-500/40 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-400 text-slate-950 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Signing Authority & User Level Settings
              </span>
              <span className="text-xs text-amber-200 font-mono">
                Republic of Kenya National PKI & Statutory Hierarchy
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Configure Officer Clearance Levels, Signing Passwords & Financial Mandates
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Define the statutory signing hierarchy from <strong>Level 1 (Sub-County QASO Inspectorate)</strong> to <strong>Level 5 (Principal Secretary)</strong>. Create official cryptographic passwords/PINs, financial approval limits, and enforce role-based execution of student transfers and capitation disbursements.
            </p>
          </div>

          <button
            onClick={() => setIsAddOfficerModalOpen(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-md flex items-center gap-2 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Signing Level / Officer</span>
          </button>
        </div>
      </div>

      {/* Statutory Levels Hierarchy Reference Guide */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-600" />
          <span>Statutory Ministry User Levels & Signing Matrix</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 text-slate-800">
              Level 1
            </span>
            <div className="font-bold text-slate-900">Sub-County QASO</div>
            <div className="text-[11px] text-slate-600">
              Quality Assurance audits, safety compliance checks, school logbook inspections.
            </div>
            <div className="text-[10px] text-slate-400 pt-1 font-mono">Limit: Zero Financial</div>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 space-y-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-900">
              Level 2
            </span>
            <div className="font-bold text-blue-950">Sub-County SCDE</div>
            <div className="text-[11px] text-blue-800">
              Inter-school transfer clearances, local admission dispute resolutions.
            </div>
            <div className="text-[10px] text-blue-700 pt-1 font-mono">Limit: KES 25,000,000</div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-300 space-y-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-200 text-emerald-950">
              Level 3
            </span>
            <div className="font-bold text-emerald-950">County Director (CDE)</div>
            <div className="text-[11px] text-emerald-800">
              County-wide capitation warrants, stream additions, emergency freezes.
            </div>
            <div className="text-[10px] text-emerald-700 pt-1 font-mono">Limit: KES 100,000,000</div>
          </div>

          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 space-y-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-900 text-purple-200">
              Level 4
            </span>
            <div className="font-bold text-purple-950">Regional Director (RDE)</div>
            <div className="text-[11px] text-purple-800">
              Cross-county learner transfers, regional development grants, QASO appeals.
            </div>
            <div className="text-[10px] text-purple-700 pt-1 font-mono">Limit: KES 250,000,000</div>
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-300 space-y-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400 text-slate-950">
              Level 5
            </span>
            <div className="font-bold text-amber-950">Principal Secretary / DG</div>
            <div className="text-[11px] text-amber-900">
              National treasury disbursements, new school gazettements, policy mandates.
            </div>
            <div className="text-[10px] text-amber-800 pt-1 font-mono">Limit: KES 1,000,000,000</div>
          </div>
        </div>
      </div>

      {/* Signing Officers Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-700" />
              <span>Authorized MoE Signing Officers & Passwords Registry</span>
            </h3>
            <span className="text-xs text-slate-500">
              Configured cryptographic credentials, assigned authority levels, and sub-county jurisdictions.
            </span>
          </div>
          <span className="px-2.5 py-1 rounded bg-slate-200 text-slate-800 text-xs font-mono font-bold">
            {officers.length} Active Signing Mandates
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-bold">
                <th className="p-3">Official Name & Badge</th>
                <th className="p-3">Authority Level</th>
                <th className="p-3">Sub-County</th>
                <th className="p-3">Capitation Limit</th>
                <th className="p-3">Signing Password / PIN</th>
                <th className="p-3">Execution Privileges</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {officers.map((officer) => (
                <tr key={officer.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{officer.name}</div>
                    <div className="text-[11px] font-mono text-emerald-700">Badge: {officer.badgeNumber}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Nat ID: {officer.nationalId}</div>
                  </td>
                  <td className="p-3">
                    <span className="font-semibold text-slate-900 block">{officer.level.split(':')[0]}</span>
                    <span className="text-[11px] text-slate-500">{officer.designation}</span>
                  </td>
                  <td className="p-3 font-medium text-slate-700">{officer.subCounty}</td>
                  <td className="p-3 font-mono font-bold text-slate-900">
                    {officer.maxCapitationApprovalKes > 0
                      ? `KES ${(officer.maxCapitationApprovalKes / 1000000).toFixed(0)}M`
                      : 'None'}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600">
                        ••••{officer.signingPin.slice(-2)}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedOfficerForPinUpdate(officer);
                          setNewPinInput('');
                          setConfirmPinInput('');
                          setPinUpdateError(null);
                        }}
                        className="text-[10px] text-emerald-700 hover:text-emerald-900 hover:underline font-bold"
                        title="Update signing password/PIN"
                      >
                        Change
                      </button>
                    </div>
                    <span className="text-[9px] text-slate-400 block font-mono truncate max-w-[140px]" title={officer.certificateFingerprint}>
                      {officer.certificateFingerprint}
                    </span>
                  </td>
                  <td className="p-3 space-y-0.5 text-[10px]">
                    <div className="flex items-center gap-1">
                      {officer.canApproveTransfers ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <X className="w-3 h-3 text-slate-300" />
                      )}
                      <span>Transfers</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {officer.canDisburseFunds ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <X className="w-3 h-3 text-slate-300" />
                      )}
                      <span>Disbursements</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {officer.canGazetteSchools ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <X className="w-3 h-3 text-slate-300" />
                      )}
                      <span>Gazettement</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        officer.status === 'Active Authorized'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {officer.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onToggleOfficerStatus(officer.id)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors ${
                        officer.status === 'Active Authorized'
                          ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                          : 'bg-emerald-700 text-white hover:bg-emerald-600 border-emerald-600'
                      }`}
                    >
                      {officer.status === 'Active Authorized' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Cryptographic Signature Testing Tool */}
      <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2 text-amber-400">
              <Fingerprint className="w-4 h-4 text-amber-400" />
              <span>Interactive Signing Mandate & Password Authentication Tester</span>
            </h3>
            <span className="text-xs text-slate-400">
              Simulate live execution of an MoE authorization with an officer's credentials and verify level permission gates.
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            PKI SHA-256 Validated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 text-[11px] mb-1">Select Signing Officer:</label>
            <select
              value={testOfficerId}
              onChange={(e) => setTestOfficerId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {officers.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.level.split(':')[0]})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-[11px] mb-1">Authorization Action Type:</label>
            <select
              value={testActionType}
              onChange={(e) => setTestActionType(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="Transfer Clearance">Inter-School Transfer Clearance</option>
              <option value="Capitation Warrant">Treasury Capitation Warrant</option>
              <option value="Institutional Charter">Institutional Charter Gazettement</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-[11px] mb-1">Enter Signing PIN / Password:</label>
            <input
              type="password"
              value={testPinInput}
              onChange={(e) => setTestPinInput(e.target.value)}
              placeholder="e.g. 4921"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRunSignatureTest}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify & Execute Signature</span>
            </button>
          </div>
        </div>

        {/* Test Result Message Box */}
        {testResult && (
          <div
            className={`p-3.5 rounded-lg border text-xs flex items-start gap-2.5 ${
              testResult.success
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200'
                : 'bg-rose-950/80 border-rose-600 text-rose-200'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="font-bold">{testResult.message}</div>
              {testResult.certSeal && (
                <div className="text-[10px] font-mono text-emerald-300">
                  Cryptographic Seal Issued: <strong>{testResult.certSeal}</strong>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL: REGISTER NEW SIGNING OFFICER & AUTHORITY LEVEL
          ========================================================================= */}
      {isAddOfficerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white px-6 py-4 flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-300 font-bold">
                Republic of Kenya · Ministry of Education Signing Authority
              </span>
              <button
                onClick={() => setIsAddOfficerModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOfficer} className="p-6 space-y-4 text-xs text-slate-800">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Create New MoE Signing Level & Officer
                </h3>
                <p className="text-slate-500 text-[11px]">
                  Assign statutory authority level, sub-county jurisdiction, and cryptographic signing password/PIN.
                </p>
              </div>

              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Full Name:</label>
                  <input
                    type="text"
                    required
                    value={newOfficerName}
                    onChange={(e) => setNewOfficerName(e.target.value)}
                    placeholder="e.g. Dr. Julius W. Mwangi"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">National ID Number:</label>
                    <input
                      type="text"
                      value={newOfficerNationalId}
                      onChange={(e) => setNewOfficerNationalId(e.target.value)}
                      placeholder="e.g. 19842019"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Official Badge Number:</label>
                    <input
                      type="text"
                      required
                      value={newOfficerBadge}
                      onChange={(e) => setNewOfficerBadge(e.target.value)}
                      placeholder="e.g. KBU-SCDE-0210"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Statutory Authority Level:</label>
                  <select
                    value={newOfficerLevel}
                    onChange={(e) => {
                      const lvl = e.target.value as MoeAuthorityLevel;
                      setNewOfficerLevel(lvl);
                      if (lvl.includes('Level 1')) {
                        setNewOfficerMaxLimit(0);
                        setCanApproveTransfers(false);
                        setCanDisburseFunds(false);
                      } else if (lvl.includes('Level 2')) {
                        setNewOfficerMaxLimit(25000000);
                        setCanApproveTransfers(true);
                        setCanDisburseFunds(false);
                      } else if (lvl.includes('Level 3')) {
                        setNewOfficerMaxLimit(100000000);
                        setCanApproveTransfers(true);
                        setCanDisburseFunds(true);
                        setCanGazetteSchools(true);
                      } else if (lvl.includes('Level 4')) {
                        setNewOfficerMaxLimit(250000000);
                        setCanApproveTransfers(true);
                        setCanDisburseFunds(true);
                        setCanGazetteSchools(true);
                      } else {
                        setNewOfficerMaxLimit(1000000000);
                        setCanApproveTransfers(true);
                        setCanDisburseFunds(true);
                        setCanGazetteSchools(true);
                        setCanFreezeAudit(true);
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Level 1: Sub-County QASO (Inspectorate)">Level 1: Sub-County QASO (Inspectorate)</option>
                    <option value="Level 2: Sub-County Director of Education (SCDE)">Level 2: Sub-County Director of Education (SCDE)</option>
                    <option value="Level 3: County Director of Education (CDE - Kiambu)">Level 3: County Director of Education (CDE - Kiambu)</option>
                    <option value="Level 4: Regional Director of Education (RDE - Central)">Level 4: Regional Director of Education (RDE - Central)</option>
                    <option value="Level 5: Director General / Principal Secretary">Level 5: Director General / Principal Secretary</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Sub-County Jurisdiction:</label>
                    <select
                      value={newOfficerSubCounty}
                      onChange={(e) => setNewOfficerSubCounty(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="All Kiambu County">All Kiambu County</option>
                      <option value="Limuru">Limuru</option>
                      <option value="Kiambu Municipality">Kiambu Municipality</option>
                      <option value="Kikuyu">Kikuyu</option>
                      <option value="Ruiru">Ruiru</option>
                      <option value="Thika East">Thika East</option>
                      <option value="Lari">Lari</option>
                      <option value="Gatundu South">Gatundu South</option>
                      <option value="Juja">Juja</option>
                      <option value="Kabete">Kabete</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Signing Password / PIN:</label>
                    <input
                      type="password"
                      required
                      value={newOfficerPin}
                      onChange={(e) => setNewOfficerPin(e.target.value)}
                      placeholder="e.g. 8821"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Capitation Financial Limit (KES):</label>
                  <input
                    type="number"
                    value={newOfficerMaxLimit}
                    onChange={(e) => setNewOfficerMaxLimit(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Checkbox Privileges */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
                    Statutory Clearance Permissions:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={canApproveTransfers}
                        onChange={(e) => setCanApproveTransfers(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Approve Transfers</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={canDisburseFunds}
                        onChange={(e) => setCanDisburseFunds(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Disburse Funds</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={canGazetteSchools}
                        onChange={(e) => setCanGazetteSchools(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Gazette Charters</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={canFreezeAudit}
                        onChange={(e) => setCanFreezeAudit(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Enforce Freeze</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddOfficerModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold shadow-md"
                >
                  Create Signing Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: UPDATE SIGNING PASSWORD / PIN
          ========================================================================= */}
      {selectedOfficerForPinUpdate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-slate-950 to-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-300">
                Reset Signing Password / PIN
              </span>
              <button
                onClick={() => setSelectedOfficerForPinUpdate(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdatePinSubmit} className="p-5 space-y-4 text-xs text-slate-800">
              <div className="space-y-1">
                <div className="font-bold text-slate-900 text-sm">
                  {selectedOfficerForPinUpdate.name}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {selectedOfficerForPinUpdate.badgeNumber} · {selectedOfficerForPinUpdate.level}
                </div>
              </div>

              {pinUpdateError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
                  {pinUpdateError}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">New Signing Password / PIN:</label>
                  <input
                    type="password"
                    required
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    placeholder="Enter at least 4 digits/characters"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Confirm Password / PIN:</label>
                  <input
                    type="password"
                    required
                    value={confirmPinInput}
                    onChange={(e) => setConfirmPinInput(e.target.value)}
                    placeholder="Re-enter password/PIN"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedOfficerForPinUpdate(null)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold shadow-xs"
                >
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
