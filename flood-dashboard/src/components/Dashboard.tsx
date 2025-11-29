'use client';

import { DistrictSummary } from '@/types';
import { 
  ClipboardList, 
  Users, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  LifeBuoy, 
  Search, 
  PhoneOff 
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
    { label: 'Total Cases', value: totalCases, borderColor: 'border-slate-400', textColor: 'text-slate-600', Icon: ClipboardList },
    { label: 'People Affected', value: totalPeople, borderColor: 'border-slate-400', textColor: 'text-slate-600', Icon: Users },
    { label: 'Critical', value: critical, borderColor: 'border-red-400', textColor: 'text-red-600', Icon: AlertCircle },
    { label: 'Pending', value: pending, borderColor: 'border-amber-400', textColor: 'text-amber-600', Icon: Clock },
    { label: 'Verified', value: verified, borderColor: 'border-emerald-400', textColor: 'text-emerald-600', Icon: CheckCircle },
    { label: 'Rescued', value: rescued, borderColor: 'border-blue-400', textColor: 'text-blue-600', Icon: LifeBuoy },
    { label: 'Missing', value: missing, borderColor: 'border-orange-400', textColor: 'text-orange-600', Icon: Search },
    { label: 'Cannot Contact', value: cannotContact, borderColor: 'border-rose-400', textColor: 'text-rose-600', Icon: PhoneOff },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-white rounded-lg p-4 border-l-4 ${card.borderColor} shadow-sm hover:shadow-md transition-shadow`}
        >
          <div className="flex items-center justify-between mb-2">
            <card.Icon size={18} className={card.textColor} />
          </div>
          <div className="text-2xl font-semibold text-slate-800">{card.value.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">{card.label}</div>
        </div>
      ))}
    </div>
  );
}

interface DistrictTableProps {
  data: DistrictSummary[];
}

export function DistrictTable({ data }: DistrictTableProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          District-wise Summary
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">District</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Total</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">People</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Pending</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Verified</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Rescued</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">No Contact</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Missing</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Critical</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">High</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Medium</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Low</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr
                key={row.district}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-slate-800">{row.district}</td>
                <td className="px-4 py-3 text-right text-slate-600">{row.total}</td>
                <td className="px-4 py-3 text-right text-slate-600">{row.totalPeople.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 border border-amber-300 text-amber-700 rounded text-xs font-medium">
                    {row.pending}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 border border-emerald-300 text-emerald-700 rounded text-xs font-medium">
                    {row.verified}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 border border-blue-300 text-blue-700 rounded text-xs font-medium">
                    {row.rescued}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 border border-rose-300 text-rose-700 rounded text-xs font-medium">
                    {row.cannotContact}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 border border-orange-300 text-orange-700 rounded text-xs font-medium">
                    {row.missing}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 border border-red-400 text-red-700 rounded text-xs font-semibold">
                    {row.critical}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-slate-600">{row.high}</td>
                <td className="px-4 py-3 text-right text-slate-500">{row.medium}</td>
                <td className="px-4 py-3 text-right text-slate-400">{row.low}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-100 border-t-2 border-slate-300">
            <tr className="font-semibold">
              <td className="px-4 py-3 text-slate-800">Total</td>
              <td className="px-4 py-3 text-right text-slate-800">{data.reduce((sum, row) => sum + row.total, 0).toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-slate-800">{data.reduce((sum, row) => sum + row.totalPeople, 0).toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-amber-700">{data.reduce((sum, row) => sum + row.pending, 0).toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-emerald-700">{data.reduce((sum, row) => sum + row.verified, 0).toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-blue-700">{data.reduce((sum, row) => sum + row.rescued, 0).toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-rose-700">{data.reduce((sum, row) => sum + row.cannotContact, 0).toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-orange-700">{data.reduce((sum, row) => sum + row.missing, 0).toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-red-700">{data.reduce((sum, row) => sum + row.critical, 0).toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-slate-700">{data.reduce((sum, row) => sum + row.high, 0).toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-slate-600">{data.reduce((sum, row) => sum + row.medium, 0).toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-slate-500">{data.reduce((sum, row) => sum + row.low, 0).toLocaleString()}</td>
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
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Emergency Types by District
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">District</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Trapped</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Food/Water</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Medical</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Rescue</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Missing</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Other</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr
                key={row.district}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-slate-800">{row.district}</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 border border-red-300 text-red-700 rounded text-xs font-medium">
                    {row.trapped}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 border border-orange-300 text-orange-700 rounded text-xs font-medium">
                    {row.foodWater}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-slate-600">{row.medical}</td>
                <td className="px-4 py-3 text-right text-slate-600">{row.rescueAssistance}</td>
                <td className="px-4 py-3 text-right text-slate-600">{row.missingPerson}</td>
                <td className="px-4 py-3 text-right text-slate-400">{row.other}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-100 border-t-2 border-slate-300">
            <tr className="font-semibold">
              <td className="px-4 py-3 text-slate-800">Total</td>
              <td className="px-4 py-3 text-right text-red-700">{data.reduce((sum, row) => sum + row.trapped, 0).toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-orange-700">{data.reduce((sum, row) => sum + row.foodWater, 0).toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-slate-700">{data.reduce((sum, row) => sum + row.medical, 0).toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-slate-700">{data.reduce((sum, row) => sum + row.rescueAssistance, 0).toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-slate-700">{data.reduce((sum, row) => sum + row.missingPerson, 0).toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-slate-500">{data.reduce((sum, row) => sum + row.other, 0).toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
