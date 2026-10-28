/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  Phone,
  ShieldCheck,
  CheckCircle2,
  X,
  ArrowRight,
  School,
  KeyRound,
  FileCheck2,
  UserCheck,
} from 'lucide-react';
import { AuthUser, UserRole } from '../types/school';
import { SYSTEM_USERS, ROLE_CONFIGS } from '../data/mockUsers';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser, isNewSignup?: boolean) => void;
  currentRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('+254 ');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('teacher');
  const [signupIdOrTsc, setSignupIdOrTsc] = useState('');
  const [signupStreamOrChild, setSignupStreamOrChild] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Check if matches any existing user email or id
    const found = SYSTEM_USERS.find(
      (u) =>
        u.email.toLowerCase() === loginEmail.toLowerCase() ||
        u.phone === loginEmail ||
        u.name.toLowerCase().includes(loginEmail.toLowerCase())
    );

    if (found) {
      onLoginSuccess(found, false);
      onClose();
    } else {
      // Create user session based on email
      const customUser: AuthUser = {
        id: 'usr_' + Date.now(),
        uuid: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        name: loginEmail.split('@')[0] || 'Staff Member',
        role: 'teacher',
        title: 'Academic Staff',
        department: 'Teaching Faculty',
        email: loginEmail,
        phone: '+254 700 000 000',
        avatarInitials: 'SM',
      };
      onLoginSuccess(customUser, false);
      onClose();
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim() || !signupEmail.trim()) {
      setErrorMsg('Please enter your full name and institutional email.');
      return;
    }

    const newUser: AuthUser = {
      id: 'usr_' + Date.now(),
      uuid: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'c83b27b1-4f9a-41d3-a3d8-5b4a921d7842',
      name: signupName.trim(),
      role: signupRole,
      title:
        signupRole === 'principal'
          ? 'Deputy Principal / Administrator'
          : signupRole === 'bursar'
          ? 'Accounts Officer'
          : signupRole === 'class_master'
          ? `Class Master (${signupStreamOrChild || 'Grade 7'})`
          : signupRole === 'teacher'
          ? 'Subject Teacher'
          : `Parent / Guardian (${signupStreamOrChild || 'Learner'})`,
      department:
        signupRole === 'bursar'
          ? 'Finance & Accounts'
          : signupRole === 'parent'
          ? 'PTA Body'
          : 'Instructional Faculty',
      email: signupEmail.trim(),
      phone: signupPhone.trim(),
      avatarInitials: signupName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase(),
      assignedGrade: signupRole === 'class_master' ? 'Grade 7' : undefined,
      assignedStream: signupRole === 'class_master' ? signupStreamOrChild : undefined,
      linkedLearnerId: signupRole === 'parent' ? 'std_g7_01' : undefined,
    };

    onLoginSuccess(newUser, true);
    onClose();
  };

  const handleQuickPersonaSelect = (user: AuthUser) => {
    onLoginSuccess(user, false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700/80 text-white flex items-center justify-center font-bold shadow-xs">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Limuru Model School ERP
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Secure Auth
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                MoE Center: 20401823 · Data Protection Act 2019 Encrypted
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

        {/* Tab switch between Login and Sign Up */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              mode === 'login'
                ? 'border-emerald-700 text-emerald-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Staff & Parent Sign In
          </button>
          <button
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              mode === 'signup'
                ? 'border-emerald-700 text-emerald-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Create New Account / Sign Up
          </button>
        </div>

        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* MODE 1: LOGIN */}
          {mode === 'login' && (
            <>
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Institutional Email / Phone / TSC Number
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. principal@limurumodel.sc.ke or TSC/398201"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-slate-700">Account Password</label>
                    <button
                      type="button"
                      onClick={() =>
                        alert(
                          'For testing, you may click any pre-configured persona below for instant 1-click authentication!'
                        )
                      }
                      className="text-emerald-700 hover:underline text-[11px]"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-500"
                    />
                    <span>Keep me logged in on this browser</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 text-xs"
                >
                  <Lock className="w-4 h-4" />
                  Sign In to School Portal
                </button>
              </form>

              {/* MOE INSPECTORATE SUPER SIGN IN */}
              <div className="mt-4 p-3 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 rounded-xl border border-emerald-500/60 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-amber-400/20 border border-amber-400/50 text-amber-300 flex items-center justify-center font-bold text-base shrink-0">
                    🇰🇪
                  </div>
                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-1.5">
                      Ministry of Education Super Sign In
                      <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded uppercase">
                        State Inspectorate
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-200">
                      County Director of Education (CDE Kiambu) & National DQAS
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const moeUser = SYSTEM_USERS.find((u) => u.role === 'moe_director');
                    if (moeUser) handleQuickPersonaSelect(moeUser);
                  }}
                  className="w-full sm:w-auto px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs shadow-xs transition-colors shrink-0 flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Super Login
                </button>
              </div>

              {/* 1-Click Persona Quick-Logins */}
              <div className="pt-4 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Or 1-Click Institutional Persona Login:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SYSTEM_USERS.map((usr) => (
                    <button
                      key={usr.id}
                      type="button"
                      onClick={() => handleQuickPersonaSelect(usr)}
                      className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 transition-colors text-left flex items-center gap-2.5"
                    >
                      <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                        {usr.avatarInitials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">{usr.name}</div>
                        <div className="text-[10px] text-slate-500 capitalize">{usr.role.replace('_', ' ')}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* MODE 2: SIGN UP */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Your Role</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { role: 'teacher', label: 'Subject Teacher', icon: '👨‍🏫' },
                    { role: 'class_master', label: 'Class Master', icon: '🎓' },
                    { role: 'bursar', label: 'Bursar / Accounts', icon: '💼' },
                    { role: 'parent', label: 'Parent / Guardian', icon: '👨‍👩‍👧' },
                  ].map((r) => (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => setSignupRole(r.role as UserRole)}
                      className={`p-2 rounded-lg border text-center font-medium transition-all ${
                        signupRole === r.role
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-base">{r.icon}</div>
                      <div className="text-[11px] font-bold mt-0.5">{r.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mdm. Tabitha Njeri Mwangi"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@limurumodel.sc.ke"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Safaricom Mobile Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="+254 7XX XXX XXX"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {signupRole === 'parent' ? 'National ID Number' : 'TSC / Staff Employee No'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={signupRole === 'parent' ? 'ID-28491021' : 'TSC/598210'}
                    value={signupIdOrTsc}
                    onChange={(e) => setSignupIdOrTsc(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {signupRole === 'parent' ? 'Child Adm No (e.g. LMS/2026/0101)' : 'Assigned Stream / Class'}
                  </label>
                  <input
                    type="text"
                    placeholder={signupRole === 'parent' ? 'LMS/2026/0101' : '7 Amboseli'}
                    value={signupStreamOrChild}
                    onChange={(e) => setSignupStreamOrChild(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Create Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-emerald-900 leading-relaxed">
                <strong>Data Privacy Notice:</strong> Your phone number and National ID will be encrypted at rest in compliance with the Kenya Data Protection Act 2019.
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 text-xs"
              >
                <UserCheck className="w-4 h-4" />
                Complete Registration & Log In
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
