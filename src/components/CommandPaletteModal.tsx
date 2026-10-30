/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  School,
  Users,
  CreditCard,
  Calendar,
  Award,
  HeartPulse,
  Building2,
  FileSpreadsheet,
  Download,
  Moon,
  Sun,
  ShieldCheck,
  ArrowRight,
  X,
  Radio,
  Command,
} from 'lucide-react';
import { Learner, KiambuSchoolRecord, ActiveTab } from '../types/school';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  onSelectLearner?: (learner: Learner) => void;
  onSelectSchool?: (school: KiambuSchoolRecord) => void;
  learners: Learner[];
  schools: KiambuSchoolRecord[];
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenAdmissions?: () => void;
  onOpenAssessmentEntry?: () => void;
}

interface PaletteItem {
  id: string;
  category: 'Navigation' | 'Learners' | 'Schools' | 'Actions';
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  action: () => void;
}

export function CommandPaletteModal({
  isOpen,
  onClose,
  onSelectTab,
  onSelectLearner,
  onSelectSchool,
  learners,
  schools,
  isDarkMode,
  onToggleTheme,
  onOpenAdmissions,
  onOpenAssessmentEntry,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global Ctrl/Cmd + K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via parent state or custom event
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Build items list
  const allItems: PaletteItem[] = useMemo(() => {
    const navItems: PaletteItem[] = [
      { id: 'nav-dash', category: 'Navigation', title: 'School Overview Dashboard', subtitle: 'Main institution metrics & attendance', icon: School, action: () => onSelectTab('dashboard') },
      { id: 'nav-adm', category: 'Navigation', title: 'Grade 1-9 Learner Registry', subtitle: 'Learner profiles, enrollment & UPIs', icon: Users, action: () => onSelectTab('admissions') },
      { id: 'nav-fees', category: 'Navigation', title: 'Fee Ledger & Voteheads', subtitle: 'Balances, receipts & collections', icon: CreditCard, action: () => onSelectTab('fees') },
      { id: 'nav-cbc', category: 'Navigation', title: 'CBC Curricular Tracking', subtitle: 'Strands, rubrics & competencies', icon: Award, action: () => onSelectTab('cbc') },
      { id: 'nav-health', category: 'Navigation', title: 'Health & Infirmary Portfolios', subtitle: 'Sickness records & hospital referrals', icon: HeartPulse, action: () => onSelectTab('portfolios') },
      { id: 'nav-time', category: 'Navigation', title: 'Master Timetable & Faculty', subtitle: 'Lessons, room allocation & leaves', icon: Calendar, action: () => onSelectTab('timetable') },
      { id: 'nav-admin', category: 'Navigation', title: 'School Administration & Staff', subtitle: 'Branches, roles & payroll linking', icon: Building2, action: () => onSelectTab('administration') },
      { id: 'nav-moe', category: 'Navigation', title: 'Ministry of Education Oversight', subtitle: 'County directorate & statutory returns', icon: ShieldCheck, action: () => onSelectTab('moe-oversight') },
    ];

    const actionItems: PaletteItem[] = [
      { id: 'act-admit', category: 'Actions', title: 'Admit New Learner', subtitle: 'Register pupil to Grades 1 to 9', icon: Users, action: () => { onClose(); onOpenAdmissions?.(); } },
      { id: 'act-cbc-entry', category: 'Actions', title: 'Quick Enter CBC Marks', subtitle: 'Record EE/ME/AE/BE formative rubrics', icon: Award, action: () => { onClose(); onOpenAssessmentEntry?.(); } },
      { id: 'act-theme', category: 'Actions', title: isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode', subtitle: 'Toggle interface visual theme', icon: isDarkMode ? Sun : Moon, action: () => { onToggleTheme(); onClose(); } },
    ];

    const learnerItems: PaletteItem[] = learners.slice(0, 15).map((l) => ({
      id: `l-${l.id}`,
      category: 'Learners',
      title: `${l.name} (${l.admissionNo})`,
      subtitle: `${l.grade} · ${l.stream} · Balance: KES ${l.fees.balance.toLocaleString()}`,
      icon: Users,
      action: () => {
        onSelectTab('admissions');
        onSelectLearner?.(l);
        onClose();
      },
    }));

    const schoolItems: PaletteItem[] = schools.map((s) => ({
      id: `s-${s.id}`,
      category: 'Schools',
      title: `${s.name} (${s.centerCode})`,
      subtitle: `${s.subCounty} · ${s.category} · ${s.enrolledLearners.toLocaleString()} learners`,
      icon: Building2,
      action: () => {
        onSelectTab('moe-oversight');
        onSelectSchool?.(s);
        onClose();
      },
    }));

    return [...actionItems, ...navItems, ...learnerItems, ...schoolItems];
  }, [learners, schools, isDarkMode, onSelectTab, onSelectLearner, onSelectSchool, onToggleTheme, onOpenAdmissions, onOpenAssessmentEntry, onClose]);

  // Filtered items
  const filteredItems = useMemo(() => {
    if (!query.trim()) return allItems.slice(0, 12);
    const q = query.toLowerCase();
    return allItems
      .filter((item) => item.title.toLowerCase().includes(q) || (item.subtitle && item.subtitle.toLowerCase().includes(q)))
      .slice(0, 15);
  }, [allItems, query]);

  // Keyboard navigation inside list
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Search learners, schools, modules, or actions... (Esc to close)"
            className="flex-1 bg-transparent text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 rounded border border-slate-200 dark:border-slate-700">
            Esc
          </kbd>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-50 dark:divide-slate-800/50">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No matching learners, schools, or actions found for &ldquo;<span className="font-bold">{query}</span>&rdquo;
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between gap-3 transition-colors ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-200'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate text-slate-900 dark:text-white">
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {item.category}
                    </span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-600' : 'text-slate-300'}`} />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <span>Use <kbd className="font-mono font-bold bg-white dark:bg-slate-800 px-1 rounded border">↑</kbd> <kbd className="font-mono font-bold bg-white dark:bg-slate-800 px-1 rounded border">↓</kbd> to navigate</span>
            <span><kbd className="font-mono font-bold bg-white dark:bg-slate-800 px-1 rounded border">↵</kbd> to select</span>
          </div>
          <span>Limuru CBC & MoE Platform</span>
        </div>
      </div>
    </div>
  );
}
