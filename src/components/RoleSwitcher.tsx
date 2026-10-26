/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  ChevronDown,
  User,
  Lock,
  Check,
  Building2,
  DollarSign,
  Award,
  Users,
  HeartHandshake,
} from 'lucide-react';
import { AuthUser, UserRole } from '../types/school';
import { SYSTEM_USERS, ROLE_CONFIGS } from '../data/mockUsers';

interface RoleSwitcherProps {
  currentUser: AuthUser;
  onSelectUser: (user: AuthUser) => void;
  onOpenPermissionMatrix: () => void;
  onOpenAuthModal?: () => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentUser,
  onSelectUser,
  onOpenPermissionMatrix,
  onOpenAuthModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'principal':
        return '👑';
      case 'bursar':
        return '💼';
      case 'class_master':
        return '🎓';
      case 'teacher':
        return '👨‍🏫';
      case 'parent':
        return '👨‍👩‍👧';
      case 'moe_director':
        return '🇰🇪';
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'moe_director':
        return 'bg-amber-100 text-amber-950 border-amber-300';
      case 'principal':
        return 'bg-purple-100 text-purple-900 border-purple-200';
      case 'bursar':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      case 'class_master':
        return 'bg-blue-100 text-blue-900 border-blue-200';
      case 'teacher':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'parent':
        return 'bg-rose-100 text-rose-900 border-rose-200';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 shadow-2xs transition-all text-left"
        title="Switch Role or View RBAC Permissions"
      >
        <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
          {currentUser.avatarInitials}
        </div>
        <div className="hidden sm:flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-900 leading-tight">
              {currentUser.name}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${getRoleBadgeColor(currentUser.role)}`}>
              {getRoleIcon(currentUser.role)} {currentUser.role.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 leading-tight">
            {currentUser.role === 'moe_director' ? 'MoE State Inspectorate (County Super Admin)' :
             currentUser.role === 'principal' ? 'Super Admin (All 16 Modules)' :
             currentUser.role === 'bursar' ? 'Finance & Accounts Officer' :
             currentUser.role === 'class_master' ? 'Grade 7 Amboseli Master' :
             currentUser.role === 'teacher' ? 'Subject Teacher' : 'Parent of Brian Omondi'}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-4 py-2 border-b border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Select Authenticated Persona
            </div>
            <div className="text-xs text-slate-500">
              Test granular permissions & data protection safeguards
            </div>
          </div>

          <div className="py-1 divide-y divide-slate-50">
            {SYSTEM_USERS.map((user) => {
              const isSelected = user.id === currentUser.id;
              const config = ROLE_CONFIGS[user.role];
              return (
                <button
                  key={user.id}
                  onClick={() => {
                    onSelectUser(user);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left flex items-start gap-3 transition-colors ${
                    isSelected ? 'bg-emerald-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {user.avatarInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {user.name}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${getRoleBadgeColor(user.role)}`}>
                        {getRoleIcon(user.role)} {user.role.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium">
                      {user.title}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                      {config.shortDescription}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="text-emerald-700 shrink-0 mt-1">
                      <Check className="w-4 h-4 font-bold" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom link to open permission matrix or sign in */}
          <div className="p-2 border-t border-slate-100 bg-slate-50/60 mt-1 space-y-1.5">
            {onOpenAuthModal && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenAuthModal();
                }}
                className="w-full py-2 px-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs"
              >
                <User className="w-3.5 h-3.5" />
                Sign In / Register New Account
              </button>
            )}
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenPermissionMatrix();
              }}
              className="w-full py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              View Granular Permissions Matrix
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
