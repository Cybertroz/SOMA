/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  MapPin,
  TrendingUp,
  ShieldCheck,
  Building2,
  DollarSign,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { formatCurrencyKES } from '../utils/formatters';

export interface SubCountyData {
  name: string;
  complianceScore: number;
  capitationAmount: number;
  schoolsCount: number;
  learnersCount: number;
  status: 'Compliant' | 'Needs Review' | 'Critical';
  flaggedIssues: string[];
}

export const KIAMBU_SUB_COUNTIES: SubCountyData[] = [
  { name: 'Limuru', complianceScore: 98, capitationAmount: 8200000, schoolsCount: 8, learnersCount: 5420, status: 'Compliant', flaggedIssues: [] },
  { name: 'Kikuyu', complianceScore: 96, capitationAmount: 9500000, schoolsCount: 9, learnersCount: 6810, status: 'Compliant', flaggedIssues: [] },
  { name: 'Ruiru', complianceScore: 92, capitationAmount: 14200000, schoolsCount: 14, learnersCount: 11400, status: 'Needs Review', flaggedIssues: ['Suffix separation delayed in 2 private schools'] },
  { name: 'Thika Town', complianceScore: 95, capitationAmount: 12800000, schoolsCount: 12, learnersCount: 9650, status: 'Compliant', flaggedIssues: [] },
  { name: 'Kiambu Municipality', complianceScore: 94, capitationAmount: 10400000, schoolsCount: 10, learnersCount: 8120, status: 'Compliant', flaggedIssues: [] },
  { name: 'Githunguri', complianceScore: 91, capitationAmount: 7600000, schoolsCount: 8, learnersCount: 4980, status: 'Needs Review', flaggedIssues: ['Sanitation ratio inspection required'] },
  { name: 'Gatundu South', complianceScore: 97, capitationAmount: 6900000, schoolsCount: 7, learnersCount: 4320, status: 'Compliant', flaggedIssues: [] },
  { name: 'Gatundu North', complianceScore: 93, capitationAmount: 5800000, schoolsCount: 6, learnersCount: 3890, status: 'Needs Review', flaggedIssues: ['STEM Lab electrical safety return due'] },
  { name: 'Kabete', complianceScore: 96, capitationAmount: 8100000, schoolsCount: 8, learnersCount: 5900, status: 'Compliant', flaggedIssues: [] },
  { name: 'Lari', complianceScore: 89, capitationAmount: 5200000, schoolsCount: 6, learnersCount: 3410, status: 'Critical', flaggedIssues: ['1 provisional school operating pending audit'] },
  { name: 'Juja', complianceScore: 93, capitationAmount: 11500000, schoolsCount: 11, learnersCount: 8750, status: 'Needs Review', flaggedIssues: ['NEMIS headcount mismatch in 1 stream'] },
  { name: 'Kiambaa', complianceScore: 95, capitationAmount: 9000000, schoolsCount: 9, learnersCount: 6200, status: 'Compliant', flaggedIssues: [] },
];

interface Props {
  selectedSubCounty: string;
  onSelectSubCounty: (subCounty: string) => void;
  isDarkMode: boolean;
}

export function KiambuSubCountyHeatmap({
  selectedSubCounty,
  onSelectSubCounty,
  isDarkMode,
}: Props) {
  const [metricMode, setMetricMode] = useState<'compliance' | 'capitation'>('compliance');
  const [hoveredSubCounty, setHoveredSubCounty] = useState<SubCountyData | null>(null);

  const getComplianceColor = (score: number) => {
    if (score >= 95) return isDarkMode ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200' : 'bg-emerald-50 border-emerald-400 text-emerald-950';
    if (score >= 91) return isDarkMode ? 'bg-amber-950/70 border-amber-600 text-amber-200' : 'bg-amber-50 border-amber-400 text-amber-950';
    return isDarkMode ? 'bg-rose-950/70 border-rose-600 text-rose-200' : 'bg-rose-50 border-rose-400 text-rose-950';
  };

  const getHeatmapColorScale = (sc: SubCountyData) => {
    if (metricMode === 'compliance') {
      return getComplianceColor(sc.complianceScore);
    }
    // Capitation scale
    if (sc.capitationAmount >= 10000000) {
      return isDarkMode ? 'bg-teal-950/80 border-teal-500 text-teal-200' : 'bg-teal-50 border-teal-500 text-teal-950';
    }
    if (sc.capitationAmount >= 7000000) {
      return isDarkMode ? 'bg-emerald-950/70 border-emerald-600 text-emerald-200' : 'bg-emerald-50 border-emerald-400 text-emerald-950';
    }
    return isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800';
  };

  return (
    <div className={`p-5 sm:p-6 rounded-2xl border space-y-6 ${
      isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
    }`}>
      {/* Header & Metric Mode Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2 text-slate-950 dark:text-white">
            <MapPin className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <span>Kiambu County Regional Oversight Heatmap</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
            12 Sub-Counties monitored under Basic Education Act statutory compliance & capitation warrants
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => setMetricMode('compliance')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                metricMode === 'compliance'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950'
              }`}
            >
              Compliance Rate (%)
            </button>
            <button
              onClick={() => setMetricMode('capitation')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                metricMode === 'capitation'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950'
              }`}
            >
              Capitation Disbursed (KES)
            </button>
          </div>

          {selectedSubCounty !== 'All' && (
            <button
              onClick={() => onSelectSubCounty('All')}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Interactive Choropleth Tiles Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {KIAMBU_SUB_COUNTIES.map((sc) => {
          const isSelected = selectedSubCounty === sc.name;
          const heatStyle = getHeatmapColorScale(sc);

          return (
            <button
              key={sc.name}
              onClick={() => onSelectSubCounty(isSelected ? 'All' : sc.name)}
              onMouseEnter={() => setHoveredSubCounty(sc)}
              onMouseLeave={() => setHoveredSubCounty(null)}
              className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer ${heatStyle} ${
                isSelected
                  ? 'ring-3 ring-emerald-600 shadow-md scale-[1.02]'
                  : 'hover:scale-[1.01] hover:shadow-sm'
              }`}
            >
              {/* Regional Ribbon Indicator */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-sm text-slate-950 dark:text-white">
                  {sc.name}
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                  sc.status === 'Compliant'
                    ? 'bg-emerald-600 text-white border-emerald-700'
                    : sc.status === 'Needs Review'
                    ? 'bg-amber-500 text-slate-950 border-amber-600'
                    : 'bg-rose-600 text-white border-rose-700'
                }`}>
                  {sc.status}
                </span>
              </div>

              {/* Metric Value */}
              <div className="text-xl font-black tabular-nums tracking-tight text-slate-950 dark:text-white">
                {metricMode === 'compliance' ? (
                  <span>{sc.complianceScore}%</span>
                ) : (
                  <span>{formatCurrencyKES(sc.capitationAmount)}</span>
                )}
              </div>

              {/* Secondary details */}
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between font-medium">
                <span>{sc.schoolsCount} Schools</span>
                <span>{sc.learnersCount.toLocaleString()} Learners</span>
              </div>

              {/* Issues badge */}
              {sc.flaggedIssues.length > 0 && (
                <div className="mt-2 text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  <span className="truncate">{sc.flaggedIssues[0]}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend & Instructions */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-bold text-slate-600 dark:text-slate-400 uppercase text-[11px]">Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600" />
            <span className="font-medium text-slate-800 dark:text-slate-200">95%+ Compliant</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="font-medium text-slate-800 dark:text-slate-200">91-94% Under Review</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-600" />
            <span className="font-medium text-slate-800 dark:text-slate-200">&lt;90% Critical Gap</span>
          </div>
        </div>

        <div className="text-slate-500 font-semibold text-xs">
          Click any sub-county to filter the schools master table
        </div>
      </div>
    </div>
  );
}
