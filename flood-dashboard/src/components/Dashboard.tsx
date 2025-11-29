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
    { label: 'Total Cases', value: totalCases, color: 'bg-blue-500', Icon: ClipboardList },
    { label: 'People Affected', value: totalPeople, color: 'bg-purple-500', Icon: Users },
    { label: 'Critical', value: critical, color: 'bg-red-600', Icon: AlertCircle },
    { label: 'Pending', value: pending, color: 'bg-amber-500', Icon: Clock },
    { label: 'Verified', value: verified, color: 'bg-emerald-500', Icon: CheckCircle },
    { label: 'Rescued', value: rescued, color: 'bg-green-500', Icon: LifeBuoy },
    { label: 'Missing', value: missing, color: 'bg-orange-500', Icon: Search },
    { label: 'Cannot Contact', value: cannotContact, color: 'bg-rose-500', Icon: PhoneOff },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.color} rounded-xl p-4 text-white shadow-lg transform hover:scale-105 transition-transform`}
        >
          <card.Icon size={24} className="mb-1" />
          <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
          <div className="text-sm opacity-90">{card.label}</div>
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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">
          District-wise Summary
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">District</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">Total</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">People</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">Pending</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">Verified</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">Rescued</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">No Contact</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">Missing</th>
              <th className="px-4 py-3 text-right font-semibold text-red-600">Critical</th>
              <th className="px-4 py-3 text-right font-semibold text-orange-500">High</th>
              <th className="px-4 py-3 text-right font-semibold text-yellow-600">Medium</th>
              <th className="px-4 py-3 text-right font-semibold text-green-600">Low</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr
                key={row.district}
                className={`hover:bg-gray-50 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-4 py-3 font-medium text-gray-800">{row.district}</td>
                <td className="px-4 py-3 text-right text-gray-600">{row.total}</td>
                <td className="px-4 py-3 text-right text-gray-600">{row.totalPeople.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                    {row.pending}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                    {row.verified}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {row.rescued}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="px-2 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-medium">
                    {row.cannotContact}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                    {row.missing}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-bold text-red-600">{row.critical}</td>
                <td className="px-4 py-3 text-right font-bold text-orange-500">{row.high}</td>
                <td className="px-4 py-3 text-right text-yellow-600">{row.medium}</td>
                <td className="px-4 py-3 text-right text-green-600">{row.low}</td>
              </tr>
            ))}
          </tbody>
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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">
          Emergency Types by District
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">District</th>
              <th className="px-4 py-3 text-right font-semibold text-red-600">Trapped</th>
              <th className="px-4 py-3 text-right font-semibold text-orange-500">Food/Water</th>
              <th className="px-4 py-3 text-right font-semibold text-purple-600">Medical</th>
              <th className="px-4 py-3 text-right font-semibold text-blue-600">Rescue</th>
              <th className="px-4 py-3 text-right font-semibold text-yellow-600">Missing</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-500">Other</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr
                key={row.district}
                className={`hover:bg-gray-50 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-4 py-3 font-medium text-gray-800">{row.district}</td>
                <td className="px-4 py-3 text-right font-bold text-red-600">{row.trapped}</td>
                <td className="px-4 py-3 text-right font-bold text-orange-500">{row.foodWater}</td>
                <td className="px-4 py-3 text-right text-purple-600">{row.medical}</td>
                <td className="px-4 py-3 text-right text-blue-600">{row.rescueAssistance}</td>
                <td className="px-4 py-3 text-right text-yellow-600">{row.missingPerson}</td>
                <td className="px-4 py-3 text-right text-gray-500">{row.other}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
