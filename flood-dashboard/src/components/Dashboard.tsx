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
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-white rounded-lg border border-slate-200 border-l-4 ${card.borderColor} p-4 shadow-sm hover:shadow-md transition-all`}
        >
          <div className="flex items-center justify-start mb-3">
            <div className={`p-2 rounded-lg ${card.iconBg}`}>
              <card.Icon size={20} className={card.iconColor} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800">{card.value.toLocaleString()}</div>
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
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <h3 className="text-sm font-semibold text-indigo-700 uppercase tracking-wide">
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
              <th className="px-4 py-3 text-right font-medium text-amber-600">Pending</th>
              <th className="px-4 py-3 text-right font-medium text-emerald-600">Verified</th>
              <th className="px-4 py-3 text-right font-medium text-cyan-600">Rescued</th>
              <th className="px-4 py-3 text-right font-medium text-rose-600">No Contact</th>
              <th className="px-4 py-3 text-right font-medium text-orange-600">Missing</th>
              <th className="px-4 py-3 text-right font-medium text-red-600">Critical</th>
              <th className="px-4 py-3 text-right font-medium text-orange-500">High</th>
              <th className="px-4 py-3 text-right font-medium text-yellow-600">Medium</th>
              <th className="px-4 py-3 text-right font-medium text-green-600">Low</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr
                key={row.district}
                className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-slate-800">{row.district}</td>
                <td className="px-4 py-3 text-right font-semibold text-indigo-600">{row.total}</td>
                <td className="px-4 py-3 text-right text-slate-600">{row.totalPeople.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 bg-amber-100 border border-amber-300 text-amber-700 rounded-full text-xs font-medium">
                    {row.pending}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 bg-emerald-100 border border-emerald-300 text-emerald-700 rounded-full text-xs font-medium">
                    {row.verified}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 bg-cyan-100 border border-cyan-300 text-cyan-700 rounded-full text-xs font-medium">
                    {row.rescued}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 bg-rose-100 border border-rose-300 text-rose-700 rounded-full text-xs font-medium">
                    {row.cannotContact}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 bg-orange-100 border border-orange-300 text-orange-700 rounded-full text-xs font-medium">
                    {row.missing}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 bg-red-100 border border-red-400 text-red-700 rounded-full text-xs font-bold">
                    {row.critical}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 bg-orange-50 text-orange-600 rounded text-xs font-medium">
                    {row.high}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 bg-yellow-50 text-yellow-600 rounded text-xs font-medium">
                    {row.medium}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 bg-green-50 text-green-600 rounded text-xs font-medium">
                    {row.low}
                  </span>
                </td>
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
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <h3 className="text-sm font-semibold text-purple-700 uppercase tracking-wide">
          Emergency Types by District
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">District</th>
              <th className="px-4 py-3 text-right font-medium text-red-600">Trapped</th>
              <th className="px-4 py-3 text-right font-medium text-orange-600">Food/Water</th>
              <th className="px-4 py-3 text-right font-medium text-cyan-600">Medical</th>
              <th className="px-4 py-3 text-right font-medium text-purple-600">Rescue</th>
              <th className="px-4 py-3 text-right font-medium text-pink-600">Missing</th>
              <th className="px-4 py-3 text-right font-medium text-slate-500">Other</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr
                key={row.district}
                className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-slate-800">{row.district}</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 bg-red-100 border border-red-300 text-red-700 rounded-full text-xs font-medium">
                    {row.trapped}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 bg-orange-100 border border-orange-300 text-orange-700 rounded-full text-xs font-medium">
                    {row.foodWater}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 bg-cyan-100 border border-cyan-300 text-cyan-700 rounded-full text-xs font-medium">
                    {row.medical}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 bg-purple-100 border border-purple-300 text-purple-700 rounded-full text-xs font-medium">
                    {row.rescueAssistance}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 bg-pink-100 border border-pink-300 text-pink-700 rounded-full text-xs font-medium">
                    {row.missingPerson}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                    {row.other}
                  </span>
                </td>
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
