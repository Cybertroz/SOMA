/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Check,
  Eye,
  Sliders,
  Shield,
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

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'principal':
        return 'Principal';
      case 'bursar':
        return 'Bursar';
      case 'class_master':
        return 'Class Master';
      case 'teacher':
        return 'Teacher';
      case 'parent':
        return 'Parent';
      case 'moe_director':
        return 'MoE Official';
      default:
        return role;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Explicit "View as:" simulated role control */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-emerald-700/60 bg-emerald-950/60 hover:bg-emerald-900 text-white shadow-2xs transition-all text-left text-xs font-medium cursor-pointer"
        title="Simulate how the dashboard appears to different staff roles and parents"
        aria-label="View dashboard as different role"
      >
        <Eye className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
        <span className="text-emerald-300 font-semibold text-[11px] uppercase tracking-wider">View as:</span>
        <span className="font-bold text-white bg-emerald-800/80 px-2 py-0.5 rounded text-xs">
          {getRoleLabel(currentUser.role)}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-emerald-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                <span>Simulate Role Perspective</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Preview access rights and scoped dashboards
              </p>
            </div>
            <button
              onClick={() => {
                onOpenPermissionMatrix();
                setIsOpen(false);
              }}
              className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1"
            >
              <Shield className="w-3 h-3" />
              <span>Matrix</span>
            </button>
          </div>

          <div className="py-1 divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
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
                  className={`w-full px-4 py-2 text-left flex items-center justify-between gap-3 transition-colors ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {getRoleLabel(user.role)}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                        ({user.name})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {config?.shortDescription || user.title}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Check className="w-4 h-4 font-bold" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
