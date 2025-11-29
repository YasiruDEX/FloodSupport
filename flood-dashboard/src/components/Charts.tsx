'use client';

import { DistrictSummary } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const STATUS_COLORS = {
  pending: '#f59e0b',
  verified: '#10b981',
  rescued: '#3b82f6',
  cannotContact: '#ef4444',
  completed: '#6366f1',
  acknowledged: '#8b5cf6',
  inProgress: '#06b6d4',
};

const PRIORITY_COLORS = {
  critical: '#dc2626',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

const EMERGENCY_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#8b5cf6',
];

interface ChartsProps {
  data: DistrictSummary[];
}

export function StatusByDistrictChart({ data }: ChartsProps) {
  const chartData = data.slice(0, 10).map((d) => ({
    name: d.district.length > 12 ? d.district.slice(0, 12) + '...' : d.district,
    Pending: d.pending,
    Verified: d.verified,
    Rescued: d.rescued,
    'Cannot Contact': d.cannotContact,
    Completed: d.completed,
  }));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Status by District (Top 10)
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            interval={0}
            fontSize={12}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Pending" stackId="a" fill={STATUS_COLORS.pending} />
          <Bar dataKey="Verified" stackId="a" fill={STATUS_COLORS.verified} />
          <Bar dataKey="Rescued" stackId="a" fill={STATUS_COLORS.rescued} />
          <Bar dataKey="Cannot Contact" stackId="a" fill={STATUS_COLORS.cannotContact} />
          <Bar dataKey="Completed" stackId="a" fill={STATUS_COLORS.completed} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PriorityByDistrictChart({ data }: ChartsProps) {
  const chartData = data.slice(0, 10).map((d) => ({
    name: d.district.length > 12 ? d.district.slice(0, 12) + '...' : d.district,
    Critical: d.critical,
    High: d.high,
    Medium: d.medium,
    Low: d.low,
  }));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Priority by District (Top 10)
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            interval={0}
            fontSize={12}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Critical" fill={PRIORITY_COLORS.critical} />
          <Bar dataKey="High" fill={PRIORITY_COLORS.high} />
          <Bar dataKey="Medium" fill={PRIORITY_COLORS.medium} />
          <Bar dataKey="Low" fill={PRIORITY_COLORS.low} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EmergencyTypePieChart({ data }: ChartsProps) {
  const totals = data.reduce(
    (acc, d) => ({
      Trapped: acc.Trapped + d.trapped,
      'Food/Water': acc['Food/Water'] + d.foodWater,
      Medical: acc.Medical + d.medical,
      'Rescue Assistance': acc['Rescue Assistance'] + d.rescueAssistance,
      'Missing Person': acc['Missing Person'] + d.missingPerson,
      Other: acc.Other + d.other,
    }),
    { Trapped: 0, 'Food/Water': 0, Medical: 0, 'Rescue Assistance': 0, 'Missing Person': 0, Other: 0 }
  );

  const pieData = Object.entries(totals)
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Emergency Types Distribution
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={EMERGENCY_COLORS[index % EMERGENCY_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PriorityPieChart({ data }: ChartsProps) {
  const totals = data.reduce(
    (acc, d) => ({
      Critical: acc.Critical + d.critical,
      High: acc.High + d.high,
      Medium: acc.Medium + d.medium,
      Low: acc.Low + d.low,
    }),
    { Critical: 0, High: 0, Medium: 0, Low: 0 }
  );

  const pieData = Object.entries(totals)
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0);

  const colors = [PRIORITY_COLORS.critical, PRIORITY_COLORS.high, PRIORITY_COLORS.medium, PRIORITY_COLORS.low];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Priority Distribution
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PeopleByDistrictChart({ data }: ChartsProps) {
  const chartData = data.slice(0, 15).map((d) => ({
    name: d.district.length > 10 ? d.district.slice(0, 10) + '...' : d.district,
    'Total People': d.totalPeople,
    'Total Cases': d.total,
  }));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        People Affected by District (Top 15)
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            interval={0}
            fontSize={11}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Total People" fill="#3b82f6" />
          <Bar dataKey="Total Cases" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function VulnerableGroupsChart({ data }: ChartsProps) {
  const totals = data.reduce(
    (acc, d) => ({
      'With Children': acc['With Children'] + d.hasChildren,
      'With Elderly': acc['With Elderly'] + d.hasElderly,
      'With Disabled': acc['With Disabled'] + d.hasDisabled,
      'Medical Emergency': acc['Medical Emergency'] + d.hasMedicalEmergency,
    }),
    { 'With Children': 0, 'With Elderly': 0, 'With Disabled': 0, 'Medical Emergency': 0 }
  );

  const chartData = Object.entries(totals).map(([name, value]) => ({ name, value }));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Vulnerable Groups
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" />
          <Tooltip />
          <Bar dataKey="value" fill="#8b5cf6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
