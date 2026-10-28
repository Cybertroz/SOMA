/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  Lock,
  CheckCircle2,
  AlertOctagon,
  Users,
  DollarSign,
  Award,
  Calendar,
  HeartPulse,
  Radio,
  FileSpreadsheet,
  Building2,
  FileCheck2,
  Edit3,
  Save,
  RotateCcw,
} from 'lucide-react';
import { AuthUser, UserRole, PermissionKey, RolePermissionConfig } from '../types/school';
import { ROLE_CONFIGS as INITIAL_ROLE_CONFIGS, SYSTEM_USERS } from '../data/mockUsers';

interface RolePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser;
  onSelectUser: (user: AuthUser) => void;
}

interface PermissionGroup {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  items: { key: PermissionKey; label: string; desc: string }[];
}

export const RolePermissionModal: React.FC<RolePermissionModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
}) => {
  const [configs, setConfigs] = useState<Record<UserRole, RolePermissionConfig>>(() => {
    const saved = localStorage.getItem('limuru_rbac_custom_configs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_ROLE_CONFIGS;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [safeguardNoticeText, setSafeguardNoticeText] = useState(
    configs[currentUser.role]?.dataSafeguardNotice || ''
  );
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTogglePermission = (role: UserRole, key: PermissionKey) => {
    if (!isEditing) return;
    setConfigs((prev) => {
      const roleConfig = prev[role];
      const updated = {
        ...prev,
        [role]: {
          ...roleConfig,
          permissions: {
            ...roleConfig.permissions,
            [key]: !roleConfig.permissions[key],
          },
        },
      };
      return updated;
    });
  };

  const handleSaveRbac = () => {
    const updated = {
      ...configs,
      [currentUser.role]: {
        ...configs[currentUser.role],
        dataSafeguardNotice: safeguardNoticeText,
      },
    };
    setConfigs(updated);
    localStorage.setItem('limuru_rbac_custom_configs', JSON.stringify(updated));
    setIsEditing(false);
    setSaveSuccessMsg('RBAC Permissions & Data Safeguards successfully updated and locked!');
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleResetDefaults = () => {
    setConfigs(INITIAL_ROLE_CONFIGS);
    setSafeguardNoticeText(INITIAL_ROLE_CONFIGS[currentUser.role].dataSafeguardNotice);
    localStorage.removeItem('limuru_rbac_custom_configs');
    setIsEditing(false);
    setSaveSuccessMsg('Reset to Kenya MoE statutory standard RBAC permissions.');
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const PERMISSION_GROUPS: PermissionGroup[] = [
    {
      name: 'Governance & Institutional Overview',
      icon: Building2,
      items: [
        { key: 'view_dashboard', label: 'Executive Dashboard', desc: 'Institutional KPIs, enrollment, collections' },
        { key: 'access_parent_portal', label: 'Parent Portal Portal', desc: 'Dedicated single-learner child interface' },
      ],
    },
    {
      name: 'Academic & CBC Evaluation',
      icon: Award,
      items: [
        { key: 'manage_cbc_marks', label: 'Edit & Upload CBC Marks', desc: 'Bulk marksheet updates, EE/ME/AE/BE ratings' },
        { key: 'view_cbc_marks', label: 'View CBC Marks', desc: 'Read-only access to learner scorecards' },
        { key: 'view_knec_analytics', label: 'KNEC & Transition Analytics', desc: 'KPSEA/KJSEA mean scores and trends' },
        { key: 'generate_report_cards', label: 'Print Official Report Cards', desc: 'Issue MoE CBC term progress documents' },
      ],
    },
    {
      name: 'Financial, Daraja & Payroll Safeguards',
      icon: DollarSign,
      items: [
        { key: 'manage_fees', label: 'Manage Fees & Excel Batch', desc: 'Post payments, reconcile fee balances' },
        { key: 'manage_daraja_mpesa', label: 'Daraja M-Pesa 2.0 C2B Sync', desc: 'Real-time Paybill webhook & auto-receipt' },
        { key: 'manage_voteheads_bursaries', label: 'Voteheads & Capitation', desc: 'MoE vote head breakdown & NG-CDF bursary' },
        { key: 'manage_payroll', label: 'Staff Payroll & KRA/SHA', desc: 'Confidential salaries, PAYE, SHA, Housing Levy' },
      ],
    },
    {
      name: 'Learner Welfare, Portfolios & SMS',
      icon: HeartPulse,
      items: [
        { key: 'manage_admissions', label: 'Learner Admissions (G1-9)', desc: 'Admit, enroll, and update NEMIS UPI' },
        { key: 'manage_portfolios_health', label: 'Health & Discipline Records', desc: 'Confidential medical allergies and incidents' },
        { key: 'send_bulk_sms', label: 'Bulk SMS Gateway', desc: 'Send fee reminders, AGM alerts to parents' },
        { key: 'manage_timetables', label: 'Timetable Scheduling Engine', desc: 'Class and teacher master periods' },
      ],
    },
    {
      name: 'Facilities & Teaching Appraisals',
      icon: FileCheck2,
      items: [
        { key: 'manage_assets', label: 'Assets & Lab Facilities', desc: 'Science lab chemicals and school property' },
        { key: 'manage_kitchen_inventory', label: 'Kitchen Stores & Granary', desc: 'Student feeding foodstuff procurement' },
        { key: 'manage_textbooks', label: 'Textbooks & Stationery', desc: 'Issuance and return tracking of books' },
        { key: 'manage_tpad', label: 'Teacher TPAD Performance', desc: 'TSC lesson appraisals and professional files' },
      ],
    },
    {
      name: 'Fleet Logistics, KEMIS & Security Audits',
      icon: ShieldCheck,
      items: [
        { key: 'manage_fleet', label: 'Fleet & Fuel Anti-Leakage', desc: 'School bus routes, fuel KM/L, maintenance' },
        { key: 'manage_kemis_sync', label: 'KEMIS / NEMIS Synchronizer', desc: 'MoE ULI validation, parent National IDs & transfers' },
        { key: 'manage_teachers', label: 'Teacher Onboarding & Faculty', desc: 'TSC permanent/BoM staff appointments' },
        { key: 'view_audit_logs', label: 'Immutable Security Audit Trail', desc: 'Download logs, PII decrypt records, AES-256 state' },
      ],
    },
    {
      name: 'Ministry of Education & State Oversight',
      icon: Building2,
      items: [
        { key: 'moe_county_oversight', label: 'Kiambu County Schools Oversight', desc: 'Inspect operations across all approved public & private schools' },
        { key: 'moe_fund_disbursement', label: 'Capitation Grants Disbursement', desc: 'Authorize Treasury IFMIS FPE & FDJSE statutory funds' },
        { key: 'moe_transfer_approval', label: 'NEMIS Inter-School Transfers', desc: 'Constitutional student transfer validation & certificates' },
      ],
    },
  ];

  const rolesList: { role: UserRole; label: string; badge: string; color: string }[] = [
    { role: 'moe_director', label: 'MoE County Director (Super Admin)', badge: 'State Authority', color: 'bg-amber-100 text-amber-950 border-amber-300' },
    { role: 'principal', label: 'Principal (School Super Admin)', badge: 'Full School Access', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { role: 'bursar', label: 'School Bursar', badge: 'Finance Only', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { role: 'class_master', label: 'Class Master (G7)', badge: 'Class Head', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { role: 'teacher', label: 'Subject Teacher', badge: 'Academics Only', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    { role: 'parent', label: 'Parent / Guardian', badge: 'Isolated Learner', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Role-Based Access Control (RBAC) & Data Safeguards
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                  Limuru Model v2.6
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Granular permission matrix enforcing compliance with the Kenya Data Protection Act 2019 & MoE Guidelines
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Persona Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 shrink-0 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-xs">
              {currentUser.avatarInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Currently Operating As:</span>
                <span className="text-sm font-bold text-slate-900">{currentUser.name}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wide">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-600">{currentUser.title} · {currentUser.department}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500 mr-1">Switch Persona:</span>
            {SYSTEM_USERS.map((user) => {
              const isSelected = user.id === currentUser.id;
              return (
                <button
                  key={user.id}
                  onClick={() => onSelectUser(user)}
                  className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs ring-2 ring-emerald-500'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {user.role === 'principal' ? '👑 Principal' :
                   user.role === 'bursar' ? '💼 Bursar' :
                   user.role === 'class_master' ? '🎓 Class Master' :
                   user.role === 'teacher' ? '👨‍🏫 Teacher' : '👨‍👩‍👧 Parent'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Data Protection Rationale Notice with Edit Support */}
        <div className="bg-amber-50/70 border-b border-amber-200 px-6 py-2.5 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-amber-900">
          <div className="flex items-start gap-2.5 flex-1">
            <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed flex-1">
              <strong className="font-semibold text-amber-950">Statutory Data Privacy Safeguard: </strong>
              {isEditing ? (
                <textarea
                  value={safeguardNoticeText}
                  onChange={(e) => setSafeguardNoticeText(e.target.value)}
                  rows={2}
                  className="w-full mt-1.5 p-2 border border-amber-300 rounded bg-white text-slate-900 font-sans text-xs focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter customized statutory data safeguard notice for this role..."
                />
              ) : (
                <span>{configs[currentUser.role]?.dataSafeguardNotice}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveRbac}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
                <button
                  onClick={handleResetDefaults}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 text-xs"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-white border border-amber-300 text-amber-950 hover:bg-amber-100/60 rounded text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                <span>Edit Permissions & Safeguards</span>
              </button>
            )}
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2 text-xs text-emerald-800 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Scrollable Matrix Table */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <th className="py-3 px-4 font-bold text-slate-900 w-1/3">
                    System Operational Capability {isEditing && <span className="text-emerald-700 font-bold ml-1">(Click cell to toggle)</span>}
                  </th>
                  {rolesList.map((r) => (
                    <th
                      key={r.role}
                      className={`py-3 px-3 text-center font-bold whitespace-nowrap ${
                        currentUser.role === r.role ? 'bg-emerald-50 text-emerald-950 font-extrabold' : ''
                      }`}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span>{r.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${r.color}`}>
                          {r.badge}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {PERMISSION_GROUPS.map((group) => {
                  const GroupIcon = group.icon;
                  return (
                    <React.Fragment key={group.name}>
                      <tr className="bg-slate-50/80 font-bold text-slate-800 text-[11px] tracking-wide uppercase">
                        <td colSpan={7} className="py-2 px-4 flex items-center gap-2 text-slate-700 bg-slate-100/60">
                          <GroupIcon className="w-3.5 h-3.5 text-slate-600" />
                          <span>{group.name}</span>
                        </td>
                      </tr>
                      {group.items.map((item) => (
                        <tr key={item.key} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 px-4">
                            <div className="font-semibold text-slate-900">{item.label}</div>
                            <div className="text-[11px] text-slate-500">{item.desc}</div>
                          </td>
                          {rolesList.map((r) => {
                            const hasPerm = configs[r.role]?.permissions[item.key];
                            const isCurrent = currentUser.role === r.role;
                            return (
                              <td
                                key={r.role}
                                onClick={() => handleTogglePermission(r.role, item.key)}
                                className={`py-2.5 px-3 text-center ${
                                  isCurrent ? 'bg-emerald-50/50' : ''
                                } ${isEditing ? 'cursor-pointer hover:bg-emerald-100/50 transition-colors' : ''}`}
                                title={isEditing ? 'Click to toggle permission' : undefined}
                              >
                                {hasPerm ? (
                                  <div className="inline-flex items-center justify-center text-emerald-600 font-medium">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center justify-center text-slate-300">
                                    <Lock className="w-3.5 h-3.5 text-slate-300" />
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Operational Guardrails Explanation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
              <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Staff Remuneration Privacy
              </div>
              <p className="text-slate-600 leading-relaxed">
                Staff payroll, PAYE deductions, and Housing Levy records are restricted strictly to authorized accounting officers, preventing disclosure among peer educators.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
              <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-rose-600" />
                Minor Data Isolation
              </div>
              <p className="text-slate-600 leading-relaxed">
                Parents are confined exclusively to their own registered child’s ledger and continuous assessment records. No parent can browse the roster or see peer learner balances.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
              <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                Separation of Finance & Grading
              </div>
              <p className="text-slate-600 leading-relaxed">
                The Bursar cannot alter CBC performance scorecards, and Teachers cannot alter fee records or Daraja M-Pesa webhooks, ensuring strict fiscal and academic audit integrity.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer with Strongly Bound User UUID */}
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-3 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-700" />
            <span>Actor Bound to UUID:</span>
            <code className="font-mono text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 font-bold">
              {currentUser.uuid}
            </code>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-md shadow-xs transition-colors"
          >
            Close Security View
          </button>
        </div>
      </div>
    </div>
  );
};
