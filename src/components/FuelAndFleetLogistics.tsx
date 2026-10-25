/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Truck,
  MapPin,
  Fuel,
  Wrench,
  Users,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Gauge,
  Plus,
  ShieldCheck,
  Search,
  DollarSign,
  Download,
  X,
  FileText,
  TrendingDown,
  Navigation,
} from 'lucide-react';
import {
  FuelFleetVehicle,
  BusRoute,
  FuelLogEntry,
  VehicleMaintenanceRecord,
  StudentTransportBooking,
  AuthUser,
} from '../types/school';
import { exportToExcel } from '../utils/excelExport';

interface FuelAndFleetLogisticsProps {
  currentUser: AuthUser;
  vehicles: FuelFleetVehicle[];
  routes: BusRoute[];
  fuelLogs: FuelLogEntry[];
  maintenanceRecords: VehicleMaintenanceRecord[];
  transportBookings: StudentTransportBooking[];
  onAddFuelLog: (log: FuelLogEntry) => void;
  onAddMaintenance: (rec: VehicleMaintenanceRecord) => void;
  onLogAudit: (action: any, resource: string, details: string) => void;
}

export const FuelAndFleetLogistics: React.FC<FuelAndFleetLogisticsProps> = ({
  currentUser,
  vehicles,
  routes,
  fuelLogs,
  maintenanceRecords,
  transportBookings,
  onAddFuelLog,
  onAddMaintenance,
  onLogAudit,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'fuel' | 'vehicles' | 'routes' | 'maintenance' | 'roster'>('fuel');

  // New Fuel Refill Modal
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id || 'veh_01');
  const [startOdo, setStartOdo] = useState<number>(148290);
  const [endOdo, setEndOdo] = useState<number>(148440);
  const [liters, setLiters] = useState<number>(36);
  const [fuelRate, setFuelRate] = useState<number>(182.5);
  const [receiptNo, setReceiptNo] = useState('TOT-LIM-');
  const [stationName, setStationName] = useState('TotalEnergies Limuru Bypass');

  // New Maintenance Modal
  const [isMaintModalOpen, setIsMaintModalOpen] = useState(false);
  const [maintVehicleId, setMaintVehicleId] = useState(vehicles[0]?.id || 'veh_01');
  const [serviceType, setServiceType] = useState<VehicleMaintenanceRecord['serviceType']>('Routine 5,000km Service');
  const [maintMileage, setMaintMileage] = useState<number>(150000);
  const [maintGarage, setMaintGarage] = useState('Isuzu East Africa Workshop');
  const [maintCost, setMaintCost] = useState<number>(25000);
  const [maintNotes, setMaintNotes] = useState('Oil, oil filter and fuel filter change.');

  // Fuel Refill Submission
  const handleFuelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const veh = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
    const dist = Math.max(1, endOdo - startOdo);
    const eff = parseFloat((dist / liters).toFixed(2));
    // Flag leakage if consumption is unusually heavy (e.g. <3.0 km/L on bus)
    const isLeakage = eff < 3.0;

    const newLog: FuelLogEntry = {
      id: 'fl_' + Date.now(),
      date: new Date().toISOString().substring(0, 10),
      vehicleId: veh.id,
      vehiclePlate: veh.registrationNumber,
      driverName: veh.assignedDriver.split('(')[0].trim(),
      startOdometerKm: startOdo,
      endOdometerKm: endOdo,
      distanceCoveredKm: dist,
      litersPumped: Number(liters),
      fuelRatePerLiter: Number(fuelRate),
      totalCostKes: Number((liters * fuelRate).toFixed(2)),
      receiptNumber: receiptNo.trim() || 'RCP-' + Math.floor(10000 + Math.random() * 90000),
      stationName,
      fuelEfficiencyKmPerLiter: eff,
      isLeakageFlagged: isLeakage,
    };

    onAddFuelLog(newLog);
    onLogAudit(
      'FLEET_FUEL_LOG',
      `Fuel Voucher: ${veh.registrationNumber} (${newLog.receiptNumber})`,
      `Refueled ${liters}L @ KES ${fuelRate} = KES ${newLog.totalCostKes}. Efficiency: ${eff} km/L. Leakage Alert: ${isLeakage ? 'YES' : 'NO'}.`
    );

    setIsFuelModalOpen(false);
    setReceiptNo('TOT-LIM-');
  };

  const handleMaintenanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const veh = vehicles.find((v) => v.id === maintVehicleId) || vehicles[0];

    const newMaint: VehicleMaintenanceRecord = {
      id: 'vm_' + Date.now(),
      vehicleId: veh.id,
      vehiclePlate: veh.registrationNumber,
      date: new Date().toISOString().substring(0, 10),
      serviceType,
      mileageAtService: maintMileage,
      garageName: maintGarage,
      costKes: maintCost,
      technicianNotes: maintNotes,
      status: 'Scheduled',
    };

    onAddMaintenance(newMaint);
    onLogAudit(
      'FLEET_FUEL_LOG',
      `Vehicle Maintenance: ${veh.registrationNumber}`,
      `Booked ${serviceType} at ${maintGarage} (Est KES ${maintCost.toLocaleString()}).`
    );

    setIsMaintModalOpen(false);
  };

  const totalFuelCost = fuelLogs.reduce((sum, f) => sum + f.totalCostKes, 0);
  const totalLitersPumped = fuelLogs.reduce((sum, f) => sum + f.litersPumped, 0);
  const totalKmRun = fuelLogs.reduce((sum, f) => sum + f.distanceCoveredKm, 0);
  const avgFleetEfficiency = totalLitersPumped > 0 ? (totalKmRun / totalLitersPumped).toFixed(2) : '4.50';
  const leakageCount = fuelLogs.filter((f) => f.isLeakageFlagged).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              Fuel, Fleet & Student Transport Logistics
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
              3 Buses Active · 91 Daily Commuters
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time tracking of school bus routes, mileage, fuel consumption per KM, maintenance schedules, and anti-leakage audits
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMaintModalOpen(true)}
            className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Wrench className="w-3.5 h-3.5 text-slate-600" />
            Schedule Service
          </button>
          <button
            onClick={() => setIsFuelModalOpen(true)}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
          >
            <Fuel className="w-4 h-4" />
            Log Fuel Voucher
          </button>
        </div>
      </div>

      {/* Operational Leakage Notice if flagged */}
      {leakageCount > 0 && (
        <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 text-xs text-rose-950 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-sm font-bold text-rose-900">
              Operational Leakage Alert: Abnormal Fuel Variance Detected!
            </strong>
            <p className="leading-relaxed">
              System detected <strong>{leakageCount} fuel entry</strong> with abnormal fuel consumption (&gt;20% variance above baseline).
              Check fuel entry on <strong>KBZ 419P</strong> (efficiency dropped to 2.92 km/L on Oct 21). An immediate mechanical inspection of fuel injection or driver audit is advised.
            </p>
          </div>
        </div>
      )}

      {/* Fleet KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
            <span>Fleet Fuel Expenditure</span>
            <DollarSign className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">
            KES {totalFuelCost.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totalLitersPumped.toFixed(1)} Liters Diesel Pumped
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
            <span>Fleet Average Efficiency</span>
            <Gauge className="w-4 h-4 text-sky-700" />
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">
            {avgFleetEfficiency} KM / Liter
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            Baseline Target: 4.2 km/L
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
            <span>Total Kilometers Run</span>
            <Navigation className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">
            {totalKmRun.toLocaleString()} KM
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across 3 Kiambu Commute Routes
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
            <span>NTSA Safety Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-bold text-emerald-800 tabular-nums">100%</div>
          <div className="text-[11px] text-slate-500 mt-1">
            All 3 Speed Governors 80km/h Valid
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'fuel', label: 'Fuel Logs & Leakage Audit', icon: Fuel },
          { id: 'vehicles', label: 'Fleet Buses & Vehicles', icon: Truck },
          { id: 'routes', label: 'Morning & Evening Routes', icon: MapPin },
          { id: 'maintenance', label: 'Maintenance & Service Records', icon: Wrench },
          { id: 'roster', label: 'Student Transport Roster', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3.5 py-2.5 rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${
                isActive
                  ? 'border-emerald-800 text-emerald-900 bg-white font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          SUB-TAB 1: FUEL CONSUMPTION & LEAKAGE AUDIT
          ========================================================================= */}
      {activeSubTab === 'fuel' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Fuel className="w-4 h-4 text-emerald-700" />
                Fuel Consumption & Mileage Efficiency Ledger
              </h3>
              <p className="text-xs text-slate-500">
                Odometer start/end readings calculate exact KM per liter to eradicate fuel pilferage
              </p>
            </div>
            <button
              onClick={() => setIsFuelModalOpen(true)}
              className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Record Fuel Refill
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Vehicle Plate</th>
                  <th className="py-2.5 px-3">Driver</th>
                  <th className="py-2.5 px-3">Odometer (Start → End)</th>
                  <th className="py-2.5 px-3">Distance</th>
                  <th className="py-2.5 px-3">Liters Pumped</th>
                  <th className="py-2.5 px-3">Total Cost (KES)</th>
                  <th className="py-2.5 px-3">Fuel Efficiency</th>
                  <th className="py-2.5 px-3">Filling Station / Voucher</th>
                  <th className="py-2.5 px-3 text-center">Leakage Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fuelLogs.map((log) => (
                  <tr
                    key={log.id}
                    className={`transition-colors ${
                      log.isLeakageFlagged ? 'bg-rose-50/70 hover:bg-rose-100/70' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">{log.date}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">{log.vehiclePlate}</td>
                    <td className="py-2.5 px-3 text-slate-700">{log.driverName}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 tabular-nums">
                      {log.startOdometerKm.toLocaleString()} → {log.endOdometerKm.toLocaleString()} km
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 tabular-nums">
                      {log.distanceCoveredKm} km
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800 tabular-nums">
                      {log.litersPumped} L
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 tabular-nums">
                      KES {log.totalCostKes.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                          log.isLeakageFlagged
                            ? 'bg-rose-100 text-rose-900 border-rose-300'
                            : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                        }`}
                      >
                        {log.fuelEfficiencyKmPerLiter} KM/L
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-600">
                      <div>{log.stationName}</div>
                      <span className="font-mono text-slate-400">{log.receiptNumber}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {log.isLeakageFlagged ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 border border-rose-400">
                          <AlertTriangle className="w-3 h-3 text-rose-700" />
                          LEAKAGE SPIKE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Normal
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 2: FLEET VEHICLES
          ========================================================================= */}
      {activeSubTab === 'vehicles' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {vehicles.map((veh) => (
            <div key={veh.id} className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                    {veh.registrationNumber}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1.5">{veh.makeModel}</h3>
                  <div className="text-xs text-slate-500">{veh.capacity} Passenger Capacity</div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    veh.status === 'Active on Route'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {veh.status}
                </span>
              </div>

              {/* Fuel Gauge */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Fuel Tank Level:</span>
                  <strong className="text-slate-900">{veh.currentFuelLevelPercent}% ({Math.round(veh.fuelTankCapacityLiters * (veh.currentFuelLevelPercent / 100))}L)</strong>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      veh.currentFuelLevelPercent > 40 ? 'bg-emerald-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${veh.currentFuelLevelPercent}%` }}
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5 text-slate-600">
                <div><strong>Assigned Driver:</strong> {veh.assignedDriver}</div>
                <div><strong>Current Odometer:</strong> {veh.currentOdometerKm.toLocaleString()} KM</div>
                <div><strong>Next 5,000km Service:</strong> {veh.nextServiceMileageKm.toLocaleString()} KM</div>
                <div><strong>Speed Governor Cert Expiry:</strong> {veh.speedGovernorCertExpiry}</div>
                <div><strong>Comprehensive Insurance:</strong> {veh.insuranceExpiry}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 3: BUS ROUTES
          ========================================================================= */}
      {activeSubTab === 'routes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {routes.map((rt) => (
            <div key={rt.id} className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{rt.name}</h3>
                  <span className="text-xs text-emerald-800 font-semibold">{rt.vehiclePlate}</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
                  {rt.enrolledStudentsCount} Commuters
                </span>
              </div>

              <div className="text-xs space-y-1.5 text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Morning Pick: <strong>{rt.morningDeparture}</strong> · Return: <strong>{rt.eveningReturn}</strong></span>
                </div>
                <div><strong>Round-Trip Distance:</strong> {rt.distanceKmPerRoundTrip} KM</div>
                <div><strong>Monthly Fuel Allocation:</strong> {rt.monthlyFuelBudgetLiters} Liters</div>
                <div><strong>Driver:</strong> {rt.driverName} ({rt.driverPhone})</div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Route Stops & Pickups:
                </span>
                <div className="space-y-1 text-[11px] text-slate-700">
                  {rt.stops.map((stop, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{stop}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 4: MAINTENANCE & REPAIRS
          ========================================================================= */}
      {activeSubTab === 'maintenance' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Vehicle Maintenance & NTSA Safety Compliance Logs
            </h3>
            <button
              onClick={() => setIsMaintModalOpen(true)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Schedule Maintenance
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Vehicle</th>
                  <th className="py-2.5 px-3">Service Type</th>
                  <th className="py-2.5 px-3">Mileage at Service</th>
                  <th className="py-2.5 px-3">Garage / Workshop</th>
                  <th className="py-2.5 px-3">Cost (KES)</th>
                  <th className="py-2.5 px-3">Technician Notes</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {maintenanceRecords.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-600">{m.date}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{m.vehiclePlate}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{m.serviceType}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{m.mileageAtService.toLocaleString()} km</td>
                    <td className="py-2.5 px-3 text-slate-700">{m.garageName}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 tabular-nums">KES {m.costKes.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-xs">{m.technicianNotes}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          m.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 5: STUDENT TRANSPORT ROSTER
          ========================================================================= */}
      {activeSubTab === 'roster' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Student School Bus Booking & Commuter Roster
            </h3>
            <span className="text-xs text-slate-500">
              {transportBookings.length} Registered Commuters
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                  <th className="py-2.5 px-3">Learner Name</th>
                  <th className="py-2.5 px-3">Grade & Stream</th>
                  <th className="py-2.5 px-3">Assigned Route</th>
                  <th className="py-2.5 px-3">Pickup / Drop-off Stage</th>
                  <th className="py-2.5 px-3">Parent Contact</th>
                  <th className="py-2.5 px-3">Term Fee (KES)</th>
                  <th className="py-2.5 px-3 text-center">Fee Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transportBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{b.learnerName}</td>
                    <td className="py-2.5 px-3 text-slate-700">{b.grade} ({b.stream})</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{b.routeName}</td>
                    <td className="py-2.5 px-3 text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                      {b.pickupDropoffStop}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{b.parentPhone}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 tabular-nums">KES {b.termTransportFee.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          b.feeStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {b.feeStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: RECORD FUEL REFILL
          ========================================================================= */}
      {isFuelModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
                  <Fuel className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Log School Bus Fuel Voucher</h3>
                  <p className="text-xs text-slate-400">Record pump liters and odometer for leakage tracking</p>
                </div>
              </div>
              <button
                onClick={() => setIsFuelModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFuelSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Bus / Vehicle</label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => {
                    setSelectedVehicleId(e.target.value);
                    const v = vehicles.find((item) => item.id === e.target.value);
                    if (v) {
                      setStartOdo(v.currentOdometerKm);
                      setEndOdo(v.currentOdometerKm + 150);
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-medium bg-white"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNumber} — {v.makeModel} (Driver: {v.assignedDriver})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Odometer (KM)</label>
                  <input
                    type="number"
                    required
                    value={startOdo}
                    onChange={(e) => setStartOdo(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Odometer (KM)</label>
                  <input
                    type="number"
                    required
                    value={endOdo}
                    onChange={(e) => setEndOdo(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Liters Pumped (L)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={liters}
                    onChange={(e) => setLiters(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rate per Liter (KES)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={fuelRate}
                    onChange={(e) => setFuelRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex justify-between items-center text-xs">
                <div>
                  <span className="text-emerald-800 font-semibold block">Calculated Total Fuel Cost:</span>
                  <span className="text-[11px] text-emerald-700">Distance: {Math.max(0, endOdo - startOdo)} KM</span>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-emerald-950">
                    KES {(liters * fuelRate).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-emerald-800 font-mono">
                    Efficiency: {liters > 0 ? ((endOdo - startOdo) / liters).toFixed(2) : 0} KM/L
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Receipt / Voucher No</label>
                  <input
                    type="text"
                    required
                    placeholder="TOT-LIM-98214"
                    value={receiptNo}
                    onChange={(e) => setReceiptNo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Filling Station</label>
                  <input
                    type="text"
                    required
                    value={stationName}
                    onChange={(e) => setStationName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFuelModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-bold shadow-xs transition-colors"
                >
                  Save Fuel Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: SCHEDULE MAINTENANCE
          ========================================================================= */}
      {isMaintModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Schedule Vehicle Maintenance</h3>
                  <p className="text-xs text-slate-400">Book service or NTSA speed governor inspection</p>
                </div>
              </div>
              <button
                onClick={() => setIsMaintModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMaintenanceSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Bus / Vehicle</label>
                <select
                  value={maintVehicleId}
                  onChange={(e) => setMaintVehicleId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-medium bg-white"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNumber} — {v.makeModel}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service Type</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-medium bg-white"
                >
                  <option value="Routine 5,000km Service">Routine 5,000km Service</option>
                  <option value="Brake Overhaul">Brake Overhaul</option>
                  <option value="Tire Replacement">Tire Replacement</option>
                  <option value="NTSA Speed Governor Inspection">NTSA Speed Governor Inspection (80km/h)</option>
                  <option value="Suspension / Spring Bush">Suspension / Spring Bush</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mileage at Service (KM)</label>
                  <input
                    type="number"
                    required
                    value={maintMileage}
                    onChange={(e) => setMaintMileage(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimated Cost (KES)</label>
                  <input
                    type="number"
                    required
                    value={maintCost}
                    onChange={(e) => setMaintCost(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Workshop / Authorized Garage</label>
                <input
                  type="text"
                  required
                  value={maintGarage}
                  onChange={(e) => setMaintGarage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Technician Scope / Notes</label>
                <textarea
                  rows={3}
                  value={maintNotes}
                  onChange={(e) => setMaintNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMaintModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-bold shadow-xs transition-colors"
                >
                  Confirm Service Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
