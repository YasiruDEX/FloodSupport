'use client';

import { useState, useMemo } from 'react';
import { DistrictSummary } from '@/types';
import { 
  ClipboardList, 
  Users, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  LifeBuoy, 
  Search, 
  PhoneOff,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

interface StatsCardsProps {
  totalCases: number;
  totalPeople: number;
  critical: number;
  pending: number;
  rescued: number;
  missing: number;
  cannotContact: number;
  verified: number;
}

export function StatsCards({
  totalCases,
  totalPeople,
  critical,
  pending,
  rescued,
  missing,
  cannotContact,
  verified,
}: StatsCardsProps) {
  const cards = [
    { label: 'Total Cases', value: totalCases, borderColor: 'border-l-blue-500', iconColor: 'text-blue-500', iconBg: 'bg-blue-50', Icon: ClipboardList },
    { label: 'People Affected', value: totalPeople, borderColor: 'border-l-indigo-500', iconColor: 'text-indigo-500', iconBg: 'bg-indigo-50', Icon: Users },
    { label: 'Critical', value: critical, borderColor: 'border-l-red-500', iconColor: 'text-red-500', iconBg: 'bg-red-50', Icon: AlertCircle },
    { label: 'Pending', value: pending, borderColor: 'border-l-amber-500', iconColor: 'text-amber-500', iconBg: 'bg-amber-50', Icon: Clock },
    { label: 'Verified', value: verified, borderColor: 'border-l-emerald-500', iconColor: 'text-emerald-500', iconBg: 'bg-emerald-50', Icon: CheckCircle },
    { label: 'Rescued', value: rescued, borderColor: 'border-l-teal-500', iconColor: 'text-teal-500', iconBg: 'bg-teal-50', Icon: LifeBuoy },
    { label: 'Missing', value: missing, borderColor: 'border-l-cyan-500', iconColor: 'text-cyan-500', iconBg: 'bg-cyan-50', Icon: Search },
    { label: 'Cannot Contact', value: cannotContact, borderColor: 'border-l-rose-500', iconColor: 'text-rose-500', iconBg: 'bg-rose-50', Icon: PhoneOff },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 md:gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-white rounded-lg border border-slate-200 border-l-4 ${card.borderColor} p-2 md:p-4 shadow-sm hover:shadow-md transition-all`}
        >
          <div className="flex items-center justify-start mb-1.5 md:mb-3">
            <div className={`p-1.5 md:p-2 rounded-lg ${card.iconBg}`}>
              <card.Icon size={16} className={`md:w-5 md:h-5 ${card.iconColor}`} />
            </div>
          </div>
          <div className="text-lg md:text-2xl font-bold text-slate-800">{card.value.toLocaleString()}</div>
          <div className="text-[10px] md:text-xs text-slate-500 mt-0.5 md:mt-1 truncate">{card.label}</div>
        </div>
      ))}
    </div>
  );
}

interface DistrictTableProps {
  data: DistrictSummary[];
}

// Sortable Header Component
interface SortableHeaderProps {
  label: string;
  sortKey: string;
  currentSort: { key: string; direction: 'asc' | 'desc' } | null;
  onSort: (key: string) => void;
  align?: 'left' | 'right';
  colorClass?: string;
}

function SortableHeader({ label, sortKey, currentSort, onSort, align = 'right', colorClass = 'text-slate-600' }: SortableHeaderProps) {
  const isActive = currentSort?.key === sortKey;
  
  return (
    <th 
      className={`px-2 md:px-4 py-2 md:py-3 ${align === 'left' ? 'text-left' : 'text-right'} font-medium ${colorClass} cursor-pointer hover:bg-slate-100 transition-colors select-none group text-[10px] md:text-sm whitespace-nowrap`}
      onClick={() => onSort(sortKey)}
    >
      <div className={`flex items-center gap-0.5 md:gap-1.5 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
        <span>{label}</span>
        <span className={`transition-opacity hidden md:inline ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
          {isActive ? (
            currentSort.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
          ) : (
            <ArrowUpDown size={14} />
          )}
        </span>
      </div>
    </th>
  );
}

export function DistrictTable({ data }: DistrictTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'total', direction: 'desc' });

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'desc' };
    });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key as keyof DistrictSummary];
      const bVal = b[sortConfig.key as keyof DistrictSummary];
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortConfig.direction === 'asc' 
        ? aStr.localeCompare(bStr) 
        : bStr.localeCompare(aStr);
    });
  }, [data, sortConfig]);

  return (
    <div className="bg-white rounded-xl md:rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-3 md:px-6 py-2 md:py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <h3 className="text-xs md:text-base font-semibold text-slate-800 uppercase tracking-wide">
            District Summary
          </h3>
          <div className="text-[10px] md:text-xs text-slate-500 hidden sm:block">
            Tap to sort
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs md:text-sm">
          <thead className="bg-slate-50/80 border-b border-slate-200">
            <tr>
              <SortableHeader label="District" sortKey="district" currentSort={sortConfig} onSort={handleSort} align="left" />
              <SortableHeader label="Total" sortKey="total" currentSort={sortConfig} onSort={handleSort} colorClass="text-indigo-600" />
              <SortableHeader label="People" sortKey="totalPeople" currentSort={sortConfig} onSort={handleSort} />
              <SortableHeader label="Pending" sortKey="pending" currentSort={sortConfig} onSort={handleSort} colorClass="text-amber-600" />
              <SortableHeader label="Verified" sortKey="verified" currentSort={sortConfig} onSort={handleSort} colorClass="text-emerald-600" />
              <SortableHeader label="Rescued" sortKey="rescued" currentSort={sortConfig} onSort={handleSort} colorClass="text-teal-600" />
              <SortableHeader label="No Contact" sortKey="cannotContact" currentSort={sortConfig} onSort={handleSort} colorClass="text-rose-600" />
              <SortableHeader label="Missing" sortKey="missing" currentSort={sortConfig} onSort={handleSort} colorClass="text-orange-600" />
              <SortableHeader label="Critical" sortKey="critical" currentSort={sortConfig} onSort={handleSort} colorClass="text-red-600" />
              <SortableHeader label="High" sortKey="high" currentSort={sortConfig} onSort={handleSort} colorClass="text-orange-500" />
              <SortableHeader label="Medium" sortKey="medium" currentSort={sortConfig} onSort={handleSort} colorClass="text-yellow-600" />
              <SortableHeader label="Low" sortKey="low" currentSort={sortConfig} onSort={handleSort} colorClass="text-green-600" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedData.map((row, index) => (
              <tr
                key={row.district}
                className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
              >
                <td className="px-2 md:px-4 py-2 md:py-3.5 font-medium text-slate-800 whitespace-nowrap">{row.district}</td>
                <td className="px-2 md:px-4 py-2 md:py-3.5 text-right font-bold text-indigo-600">{row.total}</td>
                <td className="px-2 md:px-4 py-2 md:py-3.5 text-right text-slate-600">{row.totalPeople.toLocaleString()}</td>
                <td className="px-2 md:px-4 py-2 md:py-3.5 text-right">
                  <span className="inline-flex items-center justify-center min-w-[1.5rem] md:min-w-[2.5rem] px-1 md:px-2.5 py-0.5 md:py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-[10px] md:text-xs font-semibold">
                    {row.pending}
                  </span>
                </td>
                <td className="px-2 md:px-4 py-2 md:py-3.5 text-right">
                  <span className="inline-flex items-center justify-center min-w-[1.5rem] md:min-w-[2.5rem] px-1 md:px-2.5 py-0.5 md:py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-[10px] md:text-xs font-semibold">
                    {row.verified}
                  </span>
                </td>
                <td className="px-2 md:px-4 py-2 md:py-3.5 text-right">
                  <span className="inline-flex items-center justify-center min-w-[1.5rem] md:min-w-[2.5rem] px-1 md:px-2.5 py-0.5 md:py-1 bg-teal-50 border border-teal-200 text-teal-700 rounded-full text-[10px] md:text-xs font-semibold">
                    {row.rescued}
                  </span>
                </td>
                <td className="px-2 md:px-4 py-2 md:py-3.5 text-right">
                  <span className="inline-flex items-center justify-center min-w-[1.5rem] md:min-w-[2.5rem] px-1 md:px-2.5 py-0.5 md:py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-full text-[10px] md:text-xs font-semibold">
                    {row.cannotContact}
                  </span>
                </td>
                <td className="px-2 md:px-4 py-2 md:py-3.5 text-right">
                  <span className="inline-flex items-center justify-center min-w-[1.5rem] md:min-w-[2.5rem] px-1 md:px-2.5 py-0.5 md:py-1 bg-orange-50 border border-orange-200 text-orange-700 rounded-full text-[10px] md:text-xs font-semibold">
                    {row.missing}
                  </span>
                </td>
                <td className="px-2 md:px-4 py-2 md:py-3.5 text-right">
                  <span className="inline-flex items-center justify-center min-w-[1.5rem] md:min-w-[2.5rem] px-1 md:px-2.5 py-0.5 md:py-1 bg-red-100 border border-red-300 text-red-700 rounded-full text-[10px] md:text-xs font-bold">
                    {row.critical}
                  </span>
                </td>
                <td className="px-2 md:px-4 py-2 md:py-3.5 text-right">
                  <span className="text-orange-600 font-medium">{row.high}</span>
                </td>
                <td className="px-2 md:px-4 py-2 md:py-3.5 text-right">
                  <span className="text-yellow-600 font-medium">{row.medium}</span>
                </td>
                <td className="px-2 md:px-4 py-2 md:py-3.5 text-right">
                  <span className="text-green-600 font-medium">{row.low}</span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gradient-to-r from-slate-100 to-slate-50 border-t-2 border-slate-200">
            <tr className="font-bold text-[10px] md:text-sm">
              <td className="px-2 md:px-4 py-2 md:py-4 text-slate-800">Total</td>
              <td className="px-2 md:px-4 py-2 md:py-4 text-right text-indigo-700">{data.reduce((sum, row) => sum + row.total, 0).toLocaleString()}</td>
              <td className="px-2 md:px-4 py-2 md:py-4 text-right text-slate-800">{data.reduce((sum, row) => sum + row.totalPeople, 0).toLocaleString()}</td>
              <td className="px-2 md:px-4 py-2 md:py-4 text-right text-amber-700">{data.reduce((sum, row) => sum + row.pending, 0).toLocaleString()}</td>
              <td className="px-2 md:px-4 py-2 md:py-4 text-right text-emerald-700">{data.reduce((sum, row) => sum + row.verified, 0).toLocaleString()}</td>
              <td className="px-2 md:px-4 py-2 md:py-4 text-right text-teal-700">{data.reduce((sum, row) => sum + row.rescued, 0).toLocaleString()}</td>
              <td className="px-2 md:px-4 py-2 md:py-4 text-right text-rose-700">{data.reduce((sum, row) => sum + row.cannotContact, 0).toLocaleString()}</td>
              <td className="px-2 md:px-4 py-2 md:py-4 text-right text-orange-700">{data.reduce((sum, row) => sum + row.missing, 0).toLocaleString()}</td>
              <td className="px-2 md:px-4 py-2 md:py-4 text-right text-red-700">{data.reduce((sum, row) => sum + row.critical, 0).toLocaleString()}</td>
              <td className="px-2 md:px-4 py-2 md:py-4 text-right text-orange-600">{data.reduce((sum, row) => sum + row.high, 0).toLocaleString()}</td>
              <td className="px-2 md:px-4 py-2 md:py-4 text-right text-yellow-600">{data.reduce((sum, row) => sum + row.medium, 0).toLocaleString()}</td>
              <td className="px-2 md:px-4 py-2 md:py-4 text-right text-green-600">{data.reduce((sum, row) => sum + row.low, 0).toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

interface EmergencyTypeTableProps {
  data: DistrictSummary[];
}

export function EmergencyTypeTable({ data }: EmergencyTypeTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'trapped', direction: 'desc' });

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'desc' };
    });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key as keyof DistrictSummary];
      const bVal = b[sortConfig.key as keyof DistrictSummary];
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortConfig.direction === 'asc' 
        ? aStr.localeCompare(bStr) 
        : bStr.localeCompare(aStr);
    });
  }, [data, sortConfig]);

  return (
    <div className="bg-white rounded-xl md:rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-3 md:px-6 py-2 md:py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <h3 className="text-xs md:text-base font-semibold text-slate-800 uppercase tracking-wide">
            Emergency Types
          </h3>
          <div className="text-[10px] md:text-xs text-slate-500 hidden sm:block">
            Tap to sort
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs md:text-sm">
          <thead className="bg-slate-50/80 border-b border-slate-200">
            <tr>
              <SortableHeader label="District" sortKey="district" currentSort={sortConfig} onSort={handleSort} align="left" />
              <SortableHeader label="Trapped" sortKey="trapped" currentSort={sortConfig} onSort={handleSort} colorClass="text-red-600" />
              <SortableHeader label="Food/Water" sortKey="foodWater" currentSort={sortConfig} onSort={handleSort} colorClass="text-orange-600" />
              <SortableHeader label="Medical" sortKey="medical" currentSort={sortConfig} onSort={handleSort} colorClass="text-cyan-600" />
              <SortableHeader label="Rescue" sortKey="rescueAssistance" currentSort={sortConfig} onSort={handleSort} colorClass="text-purple-600" />
              <SortableHeader label="Missing" sortKey="missingPerson" currentSort={sortConfig} onSort={handleSort} colorClass="text-pink-600" />
              <SortableHeader label="Other" sortKey="other" currentSort={sortConfig} onSort={handleSort} colorClass="text-slate-500" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedData.map((row, index) => (
              <tr
                key={row.district}
                className={`hover:bg-purple-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
              >
                <td className="px-2 md:px-4 py-2 md:py-3.5 font-medium text-slate-800 whitespace-nowrap">{row.district}</td>
                <td className="px-2 md:px-4 py-2 md:py-3.5 text-right">
                  <span className="inline-flex items-center justify-center min-w-[1.5rem] md:min-w-[2.5rem] px-1 md:px-2.5 py-0.5 md:py-1 bg-red-50 border border-red-200 text-red-700 rounded-full text-[10px] md:text-xs font-semibold">
                    {row.trapped}
                  </span>
                </td>
                <td className="px-2 md:px-4 py-2 md:py-3.5 text-right">
                  <span className="inline-flex items-center justify-center min-w-[1.5rem] md:min-w-[2.5rem] px-1 md:px-2.5 py-0.5 md:py-1 bg-orange-50 border border-orange-200 text-orange-700 rounded-full text-[10px] md:text-xs font-semibold">
                    {row.foodWater}
                  </span>
                </td>
                <td className="px-2 md:px-4 py-2 md:py-3.5 text-right">
                  <span className="inline-flex items-center justify-center min-w-[1.5rem] md:min-w-[2.5rem] px-1 md:px-2.5 py-0.5 md:py-1 bg-cyan-50 border border-cyan-200 text-cyan-700 rounded-full text-[10px] md:text-xs font-semibold">
                    {row.medical}
                  </span>
                </td>
                <td className="px-2 md:px-4 py-2 md:py-3.5 text-right">
                  <span className="inline-flex items-center justify-center min-w-[1.5rem] md:min-w-[2.5rem] px-1 md:px-2.5 py-0.5 md:py-1 bg-purple-50 border border-purple-200 text-purple-700 rounded-full text-[10px] md:text-xs font-semibold">
                    {row.rescueAssistance}
                  </span>
                </td>
                <td className="px-2 md:px-4 py-2 md:py-3.5 text-right">
                  <span className="inline-flex items-center justify-center min-w-[1.5rem] md:min-w-[2.5rem] px-1 md:px-2.5 py-0.5 md:py-1 bg-pink-50 border border-pink-200 text-pink-700 rounded-full text-[10px] md:text-xs font-semibold">
                    {row.missingPerson}
                  </span>
                </td>
                <td className="px-2 md:px-4 py-2 md:py-3.5 text-right">
                  <span className="inline-flex items-center justify-center min-w-[1.5rem] md:min-w-[2.5rem] px-1 md:px-2.5 py-0.5 md:py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded-full text-[10px] md:text-xs font-semibold">
                    {row.other}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gradient-to-r from-slate-100 to-slate-50 border-t-2 border-slate-200">
            <tr className="font-bold text-[10px] md:text-sm">
              <td className="px-2 md:px-4 py-2 md:py-4 text-slate-800">Total</td>
              <td className="px-2 md:px-4 py-2 md:py-4 text-right text-red-700">{data.reduce((sum, row) => sum + row.trapped, 0).toLocaleString()}</td>
              <td className="px-2 md:px-4 py-2 md:py-4 text-right text-orange-700">{data.reduce((sum, row) => sum + row.foodWater, 0).toLocaleString()}</td>
              <td className="px-2 md:px-4 py-2 md:py-4 text-right text-cyan-700">{data.reduce((sum, row) => sum + row.medical, 0).toLocaleString()}</td>
              <td className="px-2 md:px-4 py-2 md:py-4 text-right text-purple-700">{data.reduce((sum, row) => sum + row.rescueAssistance, 0).toLocaleString()}</td>
              <td className="px-2 md:px-4 py-2 md:py-4 text-right text-pink-700">{data.reduce((sum, row) => sum + row.missingPerson, 0).toLocaleString()}</td>
              <td className="px-2 md:px-4 py-2 md:py-4 text-right text-slate-600">{data.reduce((sum, row) => sum + row.other, 0).toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
