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

// Professional muted color palette
const STATUS_COLORS = {
  pending: '#94a3b8',
  verified: '#64748b',
  rescued: '#475569',
  cannotContact: '#cbd5e1',
  completed: '#334155',
};

const PRIORITY_COLORS = {
  critical: '#64748b',
  high: '#94a3b8',
  medium: '#cbd5e1',
  low: '#e2e8f0',
};

const EMERGENCY_COLORS = [
  '#334155',
  '#475569',
  '#64748b',
  '#94a3b8',
  '#cbd5e1',
  '#e2e8f0',
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
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h3 className="text-sm font-semibold mb-4 text-slate-700 uppercase tracking-wide">
        Status by District (Top 10)
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            interval={0}
            fontSize={11}
            tick={{ fill: '#64748b' }}
          />
          <YAxis tick={{ fill: '#64748b' }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }} 
          />
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
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h3 className="text-sm font-semibold mb-4 text-slate-700 uppercase tracking-wide">
        Priority by District (Top 10)
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            interval={0}
            fontSize={11}
            tick={{ fill: '#64748b' }}
          />
          <YAxis tick={{ fill: '#64748b' }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }} 
          />
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

  const renderLabel = (props: { name?: string; percent?: number }) => 
    `${props.name ?? ''} (${((props.percent ?? 0) * 100).toFixed(0)}%)`;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h3 className="text-sm font-semibold mb-4 text-slate-700 uppercase tracking-wide">
        Emergency Types Distribution
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={110}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={EMERGENCY_COLORS[index % EMERGENCY_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }} 
          />
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

  const renderLabel = (props: { name?: string; percent?: number }) => 
    `${props.name ?? ''} (${((props.percent ?? 0) * 100).toFixed(0)}%)`;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h3 className="text-sm font-semibold mb-4 text-slate-700 uppercase tracking-wide">
        Priority Distribution
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={110}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }} 
          />
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
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h3 className="text-sm font-semibold mb-4 text-slate-700 uppercase tracking-wide">
        People Affected by District (Top 15)
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            interval={0}
            fontSize={11}
            tick={{ fill: '#64748b' }}
          />
          <YAxis tick={{ fill: '#64748b' }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }} 
          />
          <Legend />
          <Bar dataKey="Total People" fill="#475569" />
          <Bar dataKey="Total Cases" fill="#94a3b8" />
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
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h3 className="text-sm font-semibold mb-4 text-slate-700 uppercase tracking-wide">
        Vulnerable Groups
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" tick={{ fill: '#64748b' }} />
          <YAxis dataKey="name" type="category" tick={{ fill: '#64748b' }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }} 
          />
          <Bar dataKey="value" fill="#64748b" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
