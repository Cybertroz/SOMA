/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Package,
  AlertTriangle,
  Plus,
  FileSpreadsheet,
  Download,
  Calendar,
  Users,
  CheckCircle2,
  TrendingDown,
  RefreshCw,
  Search,
  Filter,
  X,
  Clock,
  Warehouse,
} from 'lucide-react';
import { exportToExcel } from '../utils/excelExport';

export interface FoodStockItem {
  id: string;
  name: string;
  category: 'Cereals & Pulses' | 'Oils & Fats' | 'Beverages & Condiments' | 'Fresh Produce' | 'Protein & Dairy';
  currentStock: number;
  unit: string;
  reorderLevel: number;
  costPerUnitKes: number;
  supplier: string;
  lastRestocked: string;
  batchNumber: string;
}

export interface ManualMealLog {
  id: string;
  date: string;
  session: 'Morning Porridge' | '10 AM Tea Break' | 'Midday Lunch' | '4 PM Tea' | 'Boarder Dinner';
  dish: string;
  learnersServed: number;
  ingredientsUsed: string; // e.g., "2x 90kg Maize, 1x 90kg Beans, 4L Oil"
  headCook: string;
  notes: string;
}

const INITIAL_FOOD_STOCKS: FoodStockItem[] = [
  {
    id: 'fs_01',
    name: 'Dry White Maize (Grade 1)',
    category: 'Cereals & Pulses',
    currentStock: 34,
    unit: '90kg Bags',
    reorderLevel: 10,
    costPerUnitKes: 4800,
    supplier: 'Eldoret Grain Silos Ltd',
    lastRestocked: '2026-10-12',
    batchNumber: 'MZ-2026-T1-08',
  },
  {
    id: 'fs_02',
    name: 'Rosecoco Dry Beans',
    category: 'Cereals & Pulses',
    currentStock: 18,
    unit: '90kg Bags',
    reorderLevel: 8,
    costPerUnitKes: 11500,
    supplier: 'Kitale Agricultural Millers',
    lastRestocked: '2026-10-12',
    batchNumber: 'BN-2026-T1-04',
  },
  {
    id: 'fs_03',
    name: 'Yellow Beans (Special Diet/Digestive)',
    category: 'Cereals & Pulses',
    currentStock: 7,
    unit: '90kg Bags',
    reorderLevel: 5,
    costPerUnitKes: 12200,
    supplier: 'Kitale Agricultural Millers',
    lastRestocked: '2026-10-05',
    batchNumber: 'YBN-2026-T1-02',
  },
  {
    id: 'fs_04',
    name: 'Long Grain Mwea Pishori Rice',
    category: 'Cereals & Pulses',
    currentStock: 22,
    unit: '50kg Bags',
    reorderLevel: 6,
    costPerUnitKes: 7800,
    supplier: 'Mwea Rice Growers Cooperative',
    lastRestocked: '2026-10-14',
    batchNumber: 'RC-2026-091',
  },
  {
    id: 'fs_05',
    name: 'Green Grams / Ndengu',
    category: 'Cereals & Pulses',
    currentStock: 4,
    unit: '50kg Bags',
    reorderLevel: 6, // Low!
    costPerUnitKes: 6400,
    supplier: 'Machakos Farmers Union',
    lastRestocked: '2026-09-28',
    batchNumber: 'ND-2026-T1-01',
  },
  {
    id: 'fs_06',
    name: 'Millet & Soya Fortified Uji Flour',
    category: 'Cereals & Pulses',
    currentStock: 15,
    unit: '50kg Bags',
    reorderLevel: 5,
    costPerUnitKes: 4200,
    supplier: 'Nairobi Nutri-Millers',
    lastRestocked: '2026-10-15',
    batchNumber: 'UJ-2026-044',
  },
  {
    id: 'fs_07',
    name: 'Refined Vegetable Cooking Oil (Salit)',
    category: 'Oils & Fats',
    currentStock: 12,
    unit: '20L Jerrycans',
    reorderLevel: 4,
    costPerUnitKes: 4900,
    supplier: 'Kapa Oil Refineries',
    lastRestocked: '2026-10-10',
    batchNumber: 'OIL-2026-55',
  },
  {
    id: 'fs_08',
    name: 'Iodized Fine Table Salt',
    category: 'Beverages & Condiments',
    currentStock: 9,
    unit: '20kg Bales',
    reorderLevel: 3,
    costPerUnitKes: 1100,
    supplier: 'Kensalt Ltd Mombasa',
    lastRestocked: '2026-09-19',
    batchNumber: 'SALT-089',
  },
  {
    id: 'fs_09',
    name: 'Pure Kenya Loose Tea Leaves',
    category: 'Beverages & Condiments',
    currentStock: 6,
    unit: '10kg Cartons',
    reorderLevel: 3,
    costPerUnitKes: 3400,
    supplier: 'KTDA Kericho Factory',
    lastRestocked: '2026-10-02',
    batchNumber: 'TEA-2026-19',
  },
  {
    id: 'fs_10',
    name: 'White Plantation Sugar',
    category: 'Beverages & Condiments',
    currentStock: 8,
    unit: '50kg Bags',
    reorderLevel: 4,
    costPerUnitKes: 6900,
    supplier: 'Mumias Sugar Outgrowers',
    lastRestocked: '2026-10-04',
    batchNumber: 'SGR-2026-31',
  },
  {
    id: 'fs_11',
    name: 'Fresh Collard Greens (Sukuma Wiki)',
    category: 'Fresh Produce',
    currentStock: 4,
    unit: 'Sacks (approx 50kg)',
    reorderLevel: 3,
    costPerUnitKes: 2200,
    supplier: 'Kinangop Horticultural Farmers',
    lastRestocked: '2026-10-22',
    batchNumber: 'VEG-2026-WK7',
  },
  {
    id: 'fs_12',
    name: 'Fresh Cabbages',
    category: 'Fresh Produce',
    currentStock: 6,
    unit: 'Large Crates',
    reorderLevel: 4,
    costPerUnitKes: 2500,
    supplier: 'Kinangop Horticultural Farmers',
    lastRestocked: '2026-10-22',
    batchNumber: 'CAB-2026-WK7',
  },
  {
    id: 'fs_13',
    name: 'Fresh Cow Milk (Daily Delivery)',
    category: 'Protein & Dairy',
    currentStock: 120,
    unit: 'Litres',
    reorderLevel: 60,
    costPerUnitKes: 75,
    supplier: 'New KCC Nairobi Depot',
    lastRestocked: '2026-10-24',
    batchNumber: 'MLK-2026-1024',
  },
  {
    id: 'fs_14',
    name: 'Halal Grade Beef (Boneless cuts)',
    category: 'Protein & Dairy',
    currentStock: 48,
    unit: 'Kilograms',
    reorderLevel: 30,
    costPerUnitKes: 620,
    supplier: 'Kenya Meat Commission / Dagoretti',
    lastRestocked: '2026-10-23',
    batchNumber: 'BEEF-2026-H11',
  },
];

const INITIAL_MANUAL_MEAL_LOGS: ManualMealLog[] = [
  {
    id: 'mml_01',
    date: '2026-10-24',
    session: 'Morning Porridge',
    dish: 'Fortified Millet & Soya Uji with Lemon',
    learnersServed: 412,
    ingredientsUsed: '1x 50kg Uji Flour, 15kg Sugar, 1kg Salt',
    headCook: 'Chef Mary Njeri',
    notes: 'All Grade 7, 8 & 9 day-scholars and boarders served breakfast smoothly.',
  },
  {
    id: 'mml_02',
    date: '2026-10-23',
    session: 'Midday Lunch',
    dish: 'Traditional Githeri (Maize & Beans) + Steamed Sukuma',
    learnersServed: 425,
    ingredientsUsed: '2x 90kg Maize Bags, 1.5x 90kg Beans Bags, 6L Cooking Oil, 2 Sacks Sukuma',
    headCook: 'Chef Juma Bakari',
    notes: 'Yellow beans batch prepared for lactose/sensitive digestions.',
  },
  {
    id: 'mml_03',
    date: '2026-10-23',
    session: '10 AM Tea Break',
    dish: 'Chai ya Maziwa (Kenya Spiced Tea) + Mandazi',
    learnersServed: 428,
    ingredientsUsed: '50L Fresh Milk, 3kg Tea Leaves, 12kg Sugar',
    headCook: 'Chef Mary Njeri',
    notes: 'Mandazi prepared early morning by school bakery team.',
  },
  {
    id: 'mml_04',
    date: '2026-10-22',
    session: 'Midday Lunch',
    dish: 'Mwea Pishori Rice + Green Grams (Ndengu) Stew + Ripe Banana',
    learnersServed: 420,
    ingredientsUsed: '2x 50kg Rice Bags, 1.5x 50kg Ndengu Bags, 5L Cooking Oil',
    headCook: 'Chef Juma Bakari',
    notes: 'Green Grams stock depleted to 4 bags; requisition submitted.',
  },
];

export function KitchenInventory() {
  const [stocks, setStocks] = useState<FoodStockItem[]>(() => {
    const saved = localStorage.getItem('zawadi_jss_foodstocks');
    return saved ? JSON.parse(saved) : INITIAL_FOOD_STOCKS;
  });

  const [manualLogs, setManualLogs] = useState<ManualMealLog[]>(() => {
    const saved = localStorage.getItem('zawadi_jss_manual_meal_logs');
    return saved ? JSON.parse(saved) : INITIAL_MANUAL_MEAL_LOGS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [activeSubTab, setActiveSubTab] = useState<'stocks' | 'manual-meals'>('stocks');

  // Modals
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [isDispenseMealModalOpen, setIsDispenseMealModalOpen] = useState(false);

  // Forms
  const [newStockForm, setNewStockForm] = useState({
    name: '',
    category: 'Cereals & Pulses' as FoodStockItem['category'],
    currentStock: 10,
    unit: '90kg Bags',
    reorderLevel: 5,
    costPerUnitKes: 5000,
    supplier: '',
    batchNumber: '',
  });

  const [dispenseForm, setDispenseForm] = useState({
    session: 'Midday Lunch' as ManualMealLog['session'],
    dish: 'Traditional Githeri + Sautéed Sukuma',
    learnersServed: 420,
    selectedStockId: 'fs_01',
    deductQuantity: 2,
    headCook: 'Chef Mary Njeri',
    notes: 'Served in main dining hall without card tap.',
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('zawadi_jss_foodstocks', JSON.stringify(stocks));
  }, [stocks]);

  useEffect(() => {
    localStorage.setItem('zawadi_jss_manual_meal_logs', JSON.stringify(manualLogs));
  }, [manualLogs]);

  // Derived stock statistics
  const totalStockValueKes = stocks.reduce((sum, s) => sum + s.currentStock * s.costPerUnitKes, 0);
  const lowStockItems = stocks.filter((s) => s.currentStock <= s.reorderLevel);

  // Filtered stock list
  const filteredStocks = stocks.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Handle Export Stocks to Excel
  const handleExportStocksExcel = () => {
    exportToExcel(
      'Zawadi_JSS_Kitchen_Foodstock_Inventory',
      stocks,
      [
        { header: 'Batch Number', key: 'batchNumber' },
        { header: 'Food Item Name', key: 'name' },
        { header: 'Category', key: 'category' },
        { header: 'Current Stock', key: 'currentStock' },
        { header: 'Unit of Measure', key: 'unit' },
        { header: 'Reorder Level', key: 'reorderLevel' },
        { header: 'Unit Price (KES)', key: 'costPerUnitKes' },
        {
          header: 'Total Value (KES)',
          key: (item) => item.currentStock * item.costPerUnitKes,
        },
        {
          header: 'Stock Status',
          key: (item) =>
            item.currentStock <= item.reorderLevel / 2
              ? 'CRITICAL LOW'
              : item.currentStock <= item.reorderLevel
              ? 'REORDER NEEDED'
              : 'HEALTHY STOCK',
        },
        { header: 'Supplier Info', key: 'supplier' },
        { header: 'Last Restocked Date', key: 'lastRestocked' },
      ]
    );
  };

  // Handle Export Manual Meals to Excel
  const handleExportManualMealsExcel = () => {
    exportToExcel(
      'Zawadi_JSS_Manual_Meal_Dispensation_Log',
      manualLogs,
      [
        { header: 'Date', key: 'date' },
        { header: 'Meal Session', key: 'session' },
        { header: 'Dish Cooked', key: 'dish' },
        { header: 'Learners Served (Headcount)', key: 'learnersServed' },
        { header: 'Ingredients Consumed', key: 'ingredientsUsed' },
        { header: 'Head Cook / Storekeeper', key: 'headCook' },
        { header: 'Operational Remarks', key: 'notes' },
      ]
    );
  };

  // Handle Add New Stock
  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: FoodStockItem = {
      id: `fs_${Date.now()}`,
      name: newStockForm.name,
      category: newStockForm.category,
      currentStock: Number(newStockForm.currentStock),
      unit: newStockForm.unit,
      reorderLevel: Number(newStockForm.reorderLevel),
      costPerUnitKes: Number(newStockForm.costPerUnitKes),
      supplier: newStockForm.supplier || 'Local Authorized Supplier',
      lastRestocked: new Date().toISOString().slice(0, 10),
      batchNumber: newStockForm.batchNumber || `FS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    };

    setStocks((prev) => [newItem, ...prev]);
    setIsAddStockModalOpen(false);
    setNewStockForm({
      name: '',
      category: 'Cereals & Pulses',
      currentStock: 10,
      unit: '90kg Bags',
      reorderLevel: 5,
      costPerUnitKes: 5000,
      supplier: '',
      batchNumber: '',
    });
  };

  // Handle Manual Meal Dispensation & Stock Deduction
  const handleDispenseMeal = (e: React.FormEvent) => {
    e.preventDefault();

    // Deduct selected stock item
    const targetStock = stocks.find((s) => s.id === dispenseForm.selectedStockId);
    let deductionSummary = '';

    if (targetStock) {
      const deductQty = Number(dispenseForm.deductQuantity);
      setStocks((prev) =>
        prev.map((s) =>
          s.id === targetStock.id
            ? { ...s, currentStock: Math.max(0, s.currentStock - deductQty) }
            : s
        )
      );
      deductionSummary = `${deductQty}x ${targetStock.unit} ${targetStock.name}`;
    }

    // Add manual meal log
    const newManualLog: ManualMealLog = {
      id: `mml_${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      session: dispenseForm.session,
      dish: dispenseForm.dish,
      learnersServed: Number(dispenseForm.learnersServed),
      ingredientsUsed: deductionSummary || 'Kitchen Daily Batch Provisions',
      headCook: dispenseForm.headCook,
      notes: dispenseForm.notes,
    };

    setManualLogs((prev) => [newManualLog, ...prev]);
    setIsDispenseMealModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Zone */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-900">
              Kitchen Foodstock Inventory & Manual Meal Tracking
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track cereal stores, legumes, cooking oils, and dairy rations. Supports manual headcount feeding logs for schools without Tap-to-Eat.
          </p>
        </div>

        {/* Action Buttons: Excel Export & Add Stock */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={activeSubTab === 'stocks' ? handleExportStocksExcel : handleExportManualMealsExcel}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export to Excel (.xlsx/.csv)
          </button>

          {activeSubTab === 'stocks' ? (
            <button
              onClick={() => setIsAddStockModalOpen(true)}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Restock Item
            </button>
          ) : (
            <button
              onClick={() => setIsDispenseMealModalOpen(true)}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Manual Meal Batch
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Total Store Valuation</span>
          <span className="text-2xl font-bold text-slate-900 tabular-nums">
            KES {totalStockValueKes.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 block mt-1">
            Across {stocks.length} food commodity batches
          </span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Low Stock Alert</span>
          <span className="text-2xl font-bold text-amber-700 tabular-nums">
            {lowStockItems.length} Commodities
          </span>
          <span className="text-xs text-amber-800 font-medium block mt-1">
            {lowStockItems.length > 0
              ? `${lowStockItems.map((i) => i.name.split(' ')[0]).join(', ')} require requisition`
              : 'All stocks above safety threshold'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Maize & Beans Balance</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-slate-900 tabular-nums">
              {stocks.find((s) => s.id === 'fs_01')?.currentStock || 0} Maize
            </span>
            <span className="text-slate-400">/</span>
            <span className="text-xl font-bold text-slate-900 tabular-nums">
              {(stocks.find((s) => s.id === 'fs_02')?.currentStock || 0) +
                (stocks.find((s) => s.id === 'fs_03')?.currentStock || 0)}{' '}
              Beans
            </span>
          </div>
          <span className="text-xs text-slate-400 block mt-1">90kg Bags in Granary</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Offline / Manual Meals Cooked</span>
          <span className="text-2xl font-bold text-slate-900 tabular-nums">
            {manualLogs.length} Batches
          </span>
          <span className="text-xs text-slate-500 block mt-1">
            Avg {Math.round(manualLogs.reduce((acc, m) => acc + m.learnersServed, 0) / (manualLogs.length || 1))} learners/service
          </span>
        </div>
      </div>

      {/* Sub-Tab Navigation Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('stocks')}
          className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeSubTab === 'stocks'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          Foodstock Inventory Table ({stocks.length})
        </button>

        <button
          onClick={() => setActiveSubTab('manual-meals')}
          className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeSubTab === 'manual-meals'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          Manual Meal Dispensation Log ({manualLogs.length})
        </button>
      </div>

      {/* =========================================================================
          TAB 1: FOODSTOCK INVENTORY TABLE
          ========================================================================= */}
      {activeSubTab === 'stocks' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          {/* Search & Category Filter Bar */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search food item, supplier or batch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              >
                <option value="All">All Commodities</option>
                <option value="Cereals & Pulses">Cereals & Pulses</option>
                <option value="Oils & Fats">Oils & Fats</option>
                <option value="Beverages & Condiments">Beverages & Condiments</option>
                <option value="Fresh Produce">Fresh Produce</option>
                <option value="Protein & Dairy">Protein & Dairy</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Commodity & Batch</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Available Stock</th>
                  <th className="px-4 py-3 text-right">Reorder Threshold</th>
                  <th className="px-4 py-3 text-right">Unit Price (KES)</th>
                  <th className="px-4 py-3 text-right">Total Value (KES)</th>
                  <th className="px-4 py-3">Supplier & Last Inflow</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStocks.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-400">
                      No matching food commodities found in inventory.
                    </td>
                  </tr>
                ) : (
                  filteredStocks.map((item) => {
                    const isLow = item.currentStock <= item.reorderLevel;
                    const isCritical = item.currentStock <= item.reorderLevel / 2;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{item.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{item.batchNumber}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{item.category}</td>
                        <td className="px-4 py-3 text-right font-bold tabular-nums text-slate-900">
                          {item.currentStock} {item.unit}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-500 tabular-nums">
                          {item.reorderLevel} {item.unit}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-600 tabular-nums">
                          KES {item.costPerUnitKes.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-800 tabular-nums">
                          KES {(item.currentStock * item.costPerUnitKes).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-slate-800 font-medium">{item.supplier}</div>
                          <div className="text-[11px] text-slate-400">{item.lastRestocked}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isCritical ? (
                            <span className="inline-block bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[11px] font-bold">
                              Critical Low
                            </span>
                          ) : isLow ? (
                            <span className="inline-block bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                              Reorder
                            </span>
                          ) : (
                            <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-medium">
                              In Stock
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => {
                                setStocks((prev) =>
                                  prev.map((s) =>
                                    s.id === item.id ? { ...s, currentStock: s.currentStock + 5 } : s
                                  )
                                );
                              }}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[11px]"
                              title="Add 5 units"
                            >
                              +5
                            </button>
                            <button
                              onClick={() => {
                                setStocks((prev) =>
                                  prev.map((s) =>
                                    s.id === item.id ? { ...s, currentStock: Math.max(0, s.currentStock - 1) } : s
                                  )
                                );
                              }}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded font-semibold text-[11px]"
                              title="Deduct 1 unit"
                            >
                              -1
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: MANUAL MEAL DISPENSATION LOG TABLE (FOR SCHOOLS WITHOUT TAP-TO-EAT)
          ========================================================================= */}
      {activeSubTab === 'manual-meals' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <div>
              <h3 className="font-semibold text-slate-900">
                Manual Kitchen Cooking & Headcount Feeding Ledger
              </h3>
              <p className="text-slate-500">
                Used for traditional serving or when the Tap-to-Eat terminal is offline. Automatically accounts for inventory deductions.
              </p>
            </div>
            <button
              onClick={() => setIsDispenseMealModalOpen(true)}
              className="px-3 py-1.5 bg-emerald-700 text-white rounded font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Batch Cook
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Meal Session</th>
                  <th className="px-4 py-3">Dish Prepared</th>
                  <th className="px-4 py-3 text-right">Learners Fed</th>
                  <th className="px-4 py-3">Ingredients Consumed</th>
                  <th className="px-4 py-3">Head Cook in Charge</th>
                  <th className="px-4 py-3">Staff Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {manualLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-600 font-medium whitespace-nowrap">
                      {log.date}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {log.session}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {log.dish}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-800 tabular-nums">
                      {log.learnersServed} Pupils
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={log.ingredientsUsed}>
                      {log.ingredientsUsed}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {log.headCook}
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate" title={log.notes}>
                      {log.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: ADD FOODSTOCK REPLENISHMENT
          ========================================================================= */}
      {isAddStockModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">Restock Kitchen Inventory</h3>
              </div>
              <button
                onClick={() => setIsAddStockModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStock} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Commodity Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dry Maize, Longhorn Rice, Kensalt"
                  value={newStockForm.name}
                  onChange={(e) => setNewStockForm({ ...newStockForm, name: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category:</label>
                  <select
                    value={newStockForm.category}
                    onChange={(e) =>
                      setNewStockForm({ ...newStockForm, category: e.target.value as FoodStockItem['category'] })
                    }
                    className="w-full border border-slate-300 rounded px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Cereals & Pulses">Cereals & Pulses</option>
                    <option value="Oils & Fats">Oils & Fats</option>
                    <option value="Beverages & Condiments">Beverages & Condiments</option>
                    <option value="Fresh Produce">Fresh Produce</option>
                    <option value="Protein & Dairy">Protein & Dairy</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Unit of Measure:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 90kg Bags, 20L Jerrycans"
                    value={newStockForm.unit}
                    onChange={(e) => setNewStockForm({ ...newStockForm, unit: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Quantity Received:</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newStockForm.currentStock}
                    onChange={(e) => setNewStockForm({ ...newStockForm, currentStock: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-bold tabular-nums text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Reorder Level:</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newStockForm.reorderLevel}
                    onChange={(e) => setNewStockForm({ ...newStockForm, reorderLevel: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs tabular-nums text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Unit Price (KES):</label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={newStockForm.costPerUnitKes}
                    onChange={(e) => setNewStockForm({ ...newStockForm, costPerUnitKes: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs tabular-nums text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Supplier Info:</label>
                  <input
                    type="text"
                    placeholder="e.g. Eldoret Silos"
                    value={newStockForm.supplier}
                    onChange={(e) => setNewStockForm({ ...newStockForm, supplier: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddStockModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white rounded text-xs font-semibold hover:bg-emerald-800"
                >
                  Save Commodity to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: MANUAL MEAL BATCH LOG & INVENTORY DEDUCTION
          ========================================================================= */}
      {isDispenseMealModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">Record Batch Meal Preparation</h3>
              </div>
              <button
                onClick={() => setIsDispenseMealModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDispenseMeal} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Meal Session:</label>
                  <select
                    value={dispenseForm.session}
                    onChange={(e) =>
                      setDispenseForm({ ...dispenseForm, session: e.target.value as ManualMealLog['session'] })
                    }
                    className="w-full border border-slate-300 rounded px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Morning Porridge">Morning Porridge</option>
                    <option value="10 AM Tea Break">10 AM Tea Break</option>
                    <option value="Midday Lunch">Midday Lunch</option>
                    <option value="4 PM Tea">4 PM Tea</option>
                    <option value="Boarder Dinner">Boarder Dinner</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Learners Served:</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={dispenseForm.learnersServed}
                    onChange={(e) => setDispenseForm({ ...dispenseForm, learnersServed: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs font-bold tabular-nums text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Dish Cooked:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Githeri with greens, Rice & Ndengu, Uji"
                  value={dispenseForm.dish}
                  onChange={(e) => setDispenseForm({ ...dispenseForm, dish: e.target.value })}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Deduct Commodity:</label>
                  <select
                    value={dispenseForm.selectedStockId}
                    onChange={(e) => setDispenseForm({ ...dispenseForm, selectedStockId: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800"
                  >
                    {stocks.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Bal: {s.currentStock} {s.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Deduct Qty:</label>
                  <input
                    type="number"
                    min="1"
                    value={dispenseForm.deductQuantity}
                    onChange={(e) => setDispenseForm({ ...dispenseForm, deductQuantity: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs font-bold tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Head Cook:</label>
                  <input
                    type="text"
                    required
                    value={dispenseForm.headCook}
                    onChange={(e) => setDispenseForm({ ...dispenseForm, headCook: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Notes / Diet:</label>
                  <input
                    type="text"
                    value={dispenseForm.notes}
                    onChange={(e) => setDispenseForm({ ...dispenseForm, notes: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDispenseMealModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white rounded text-xs font-semibold hover:bg-emerald-800"
                >
                  Confirm & Deduct Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
