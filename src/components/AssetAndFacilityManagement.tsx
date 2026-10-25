/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Package,
  Layers,
  Search,
  Plus,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Building,
  Bed,
  FlaskConical,
  Monitor,
} from 'lucide-react';
import { AssetItem } from '../types/school';
import { exportToExcel } from '../utils/excelExport';

interface Props {
  assets: AssetItem[];
  onAddAsset?: (asset: AssetItem) => void;
}

export function AssetAndFacilityManagement({ assets }: Props) {
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredAssets = assets.filter((item) => {
    if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.serialOrTag.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.custodianStaff.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportExcel = () => {
    exportToExcel(
      'Limuru_Model_Institutional_Assets_and_Facilities_Register',
      filteredAssets,
      [
        { header: 'Tag / Serial No', key: 'serialOrTag' },
        { header: 'Asset Description', key: 'name' },
        { header: 'Category', key: 'category' },
        { header: 'Quantity', key: 'quantity' },
        { header: 'Unit', key: 'unit' },
        { header: 'Location / Room', key: 'location' },
        { header: 'Condition', key: 'condition' },
        { header: 'Custodian Staff', key: 'custodianStaff' },
        { header: 'Last Audit Date', key: 'lastAudited' },
      ]
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Strip */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">
              Institutional Asset & Facility Inventory
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Limuru Model School · Science lab chemicals & apparatus, ICT workstations, hostel allocations & sports equipment
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            Export Asset Register (.csv)
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {[
            'All',
            'Science Lab Chemical / Apparatus',
            'ICT & Computer Lab',
            'Boarding Facility / Dorm',
            'Sports Equipment',
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                categoryFilter === cat
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-56">
          <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tag, item, room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="p-3">Asset Tag</th>
                <th className="p-3">Equipment / Chemical Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Facility Location</th>
                <th className="p-3">Custodian</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssets.map((ast) => (
                <tr key={ast.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-medium text-slate-600">{ast.serialOrTag}</td>
                  <td className="p-3 font-semibold text-slate-900">{ast.name}</td>
                  <td className="p-3 text-slate-700">{ast.category}</td>
                  <td className="p-3 font-bold text-slate-900 tabular-nums">
                    {ast.quantity} {ast.unit}
                  </td>
                  <td className="p-3 text-slate-700">{ast.location}</td>
                  <td className="p-3 text-slate-600">{ast.custodianStaff}</td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {ast.condition}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
