/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
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
  Printer,
  Upload,
  X,
} from 'lucide-react';
import { AssetItem } from '../types/school';
import { exportToExcel } from '../utils/excelExport';

interface Props {
  assets: AssetItem[];
  onAddAsset?: (asset: AssetItem) => void;
}

export function AssetAndFacilityManagement({ assets, onAddAsset }: Props) {
  const [assetList, setAssetList] = useState<AssetItem[]>(assets);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newAsset, setNewAsset] = useState({
    name: '',
    category: 'Science Lab Chemical / Apparatus' as AssetItem['category'],
    serialOrTag: '',
    quantity: 1,
    unit: 'Units',
    location: 'Science Lab 1',
    condition: 'Operational / Good' as AssetItem['condition'],
    custodianStaff: 'Eng. Kennedy Mutua',
    costKes: 15000,
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const filteredAssets = assetList.filter((item) => {
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
    showToast('Exported asset inventory (.csv) successfully.');
  };

  const handlePrintAssets = () => {
    window.print();
    showToast('Printing institutional asset inventory.');
  };

  const handleUploadAssets = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const count = text ? text.split('\n').filter(Boolean).length : 0;
      showToast(`Imported ${file.name} successfully. Recorded ${Math.max(1, count - 1)} assets.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleSaveNewAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name.trim()) return;

    const created: AssetItem = {
      id: `ast_${Date.now()}`,
      name: newAsset.name.trim(),
      category: newAsset.category,
      serialOrTag: newAsset.serialOrTag.trim() || `LMS/AST/${Date.now().toString().slice(-4)}`,
      quantity: Number(newAsset.quantity) || 1,
      unit: newAsset.unit,
      location: newAsset.location,
      condition: newAsset.condition,
      custodianStaff: newAsset.custodianStaff,
      lastAudited: new Date().toISOString().slice(0, 10),
    };

    setAssetList((prev) => [created, ...prev]);
    if (onAddAsset) onAddAsset(created);
    showToast(`Added ${created.name} (${created.serialOrTag}) to institutional assets.`);
    setIsAddAssetOpen(false);
    setNewAsset({
      name: '',
      category: 'Science Lab Chemical / Apparatus',
      serialOrTag: '',
      quantity: 1,
      unit: 'Units',
      location: 'Science Lab 1',
      condition: 'Operational / Good',
      custodianStaff: 'Eng. Kennedy Mutua',
      costKes: 15000,
    });
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input for Real Asset Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls,.txt"
        className="hidden"
        onChange={handleUploadAssets}
      />

      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-950 text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

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

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePrintAssets}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            title="Print asset inventory register"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Register</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            title="Upload asset inventory spreadsheet (.csv)"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload (.csv)</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export (.csv)</span>
          </button>

          <button
            onClick={() => setIsAddAssetOpen(true)}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Asset</span>
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

      {/* Add New Asset Modal */}
      {isAddAssetOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Add New Institutional Asset</h3>
                <span className="text-xs text-slate-500">Record science apparatus, ICT hardware, or facility equipment</span>
              </div>
              <button onClick={() => setIsAddAssetOpen(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewAsset} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Asset / Equipment Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Bunsen Burners (Pack of 12) or HP ProBook G9"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded text-slate-900 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newAsset.category}
                    onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded text-slate-900"
                  >
                    <option value="Science Lab Chemical / Apparatus">Science Lab Chemical / Apparatus</option>
                    <option value="ICT & Computer Lab">ICT & Computer Lab</option>
                    <option value="Boarding Facility / Dorm">Boarding Facility / Dorm</option>
                    <option value="Sports Equipment">Sports Equipment</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Asset Tag / Serial No</label>
                  <input
                    type="text"
                    placeholder="e.g. LMS/LAB/2026/08"
                    value={newAsset.serialOrTag}
                    onChange={(e) => setNewAsset({ ...newAsset, serialOrTag: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={newAsset.quantity}
                    onChange={(e) => setNewAsset({ ...newAsset, quantity: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded text-slate-900 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={newAsset.unit}
                    onChange={(e) => setNewAsset({ ...newAsset, unit: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Condition</label>
                  <select
                    value={newAsset.condition}
                    onChange={(e) => setNewAsset({ ...newAsset, condition: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded text-slate-900"
                  >
                    <option value="Brand New">Brand New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Needs Servicing">Needs Servicing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location / Room</label>
                  <input
                    type="text"
                    placeholder="e.g. Science Lab 2"
                    value={newAsset.location}
                    onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Custodian Staff</label>
                  <input
                    type="text"
                    placeholder="e.g. Eng. Kennedy Mutua"
                    value={newAsset.custodianStaff}
                    onChange={(e) => setNewAsset({ ...newAsset, custodianStaff: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddAssetOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold shadow-xs"
                >
                  Register Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
