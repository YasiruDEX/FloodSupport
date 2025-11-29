'use client';

import { useState, useMemo } from 'react';
import { DistrictSummary, SOSRecord } from '@/types';
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
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { Filter } from 'lucide-react';


// Colorful palette
const STATUS_COLORS = {
  pending: '#f59e0b',    // amber
  verified: '#10b981',   // emerald
  rescued: '#3b82f6',    // blue
  cannotContact: '#ef4444', // red
  completed: '#8b5cf6',  // violet
};

const PRIORITY_COLORS = {
  critical: '#dc2626',   // red
  high: '#f97316',       // orange
  medium: '#eab308',     // yellow
  low: '#22c55e',        // green
};

const EMERGENCY_COLORS = [
  '#ef4444', // red - Trapped
  '#f97316', // orange - Food/Water
  '#3b82f6', // blue - Medical
  '#8b5cf6', // violet - Rescue
  '#06b6d4', // cyan - Missing
  '#64748b', // slate - Other

];

const VULNERABLE_COLORS = ['#ec4899', '#8b5cf6', '#06b6d4', '#ef4444'];

interface ChartsProps {
  data: DistrictSummary[];
}

interface StatusByDistrictChartProps extends ChartsProps {
  topN?: number;
}

export function StatusByDistrictChart({ data, topN = 10 }: StatusByDistrictChartProps) {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['Pending', 'Verified', 'Rescued', 'Cannot Contact', 'Completed']);
  const [showFilter, setShowFilter] = useState(false);
  const [limit, setLimit] = useState(topN);

  const allStatuses = ['Pending', 'Verified', 'Rescued', 'Cannot Contact', 'Completed'];
  
  const chartData = data.slice(0, limit).map((d) => ({
    name: d.district.length > 12 ? d.district.slice(0, 12) + '...' : d.district,
    Pending: d.pending,
    Verified: d.verified,
    Rescued: d.rescued,
    'Cannot Contact': d.cannotContact,
    Completed: d.completed,
  }));

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const getStatusColor = (status: string) => {
    const key = status.toLowerCase().replace(' ', '') as keyof typeof STATUS_COLORS;
    return STATUS_COLORS[key] || '#64748b';
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Status by District
        </h3>
        <button 
          onClick={() => setShowFilter(!showFilter)}
          className={`p-2 rounded-lg border transition-colors ${showFilter ? 'bg-slate-100 border-slate-300' : 'border-slate-200 hover:bg-slate-50'}`}
        >
          <Filter size={16} className="text-slate-600" />
        </button>
      </div>
      
      {showFilter && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex flex-wrap gap-2 mb-3">
            {allStatuses.map(status => (
              <button
                key={status}
                onClick={() => toggleStatus(status)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedStatuses.includes(status)
                    ? 'text-white'
                    : 'bg-white border border-slate-300 text-slate-600'
                }`}
                style={selectedStatuses.includes(status) ? { backgroundColor: getStatusColor(status) } : {}}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-600">Show top:</label>
            <select 
              value={limit} 
              onChange={(e) => setLimit(Number(e.target.value))}
              className="px-2 py-1 text-xs border border-slate-300 rounded"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
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
          <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '20px' }} />
          {selectedStatuses.includes('Pending') && <Bar dataKey="Pending" stackId="a" fill={STATUS_COLORS.pending} />}
          {selectedStatuses.includes('Verified') && <Bar dataKey="Verified" stackId="a" fill={STATUS_COLORS.verified} />}
          {selectedStatuses.includes('Rescued') && <Bar dataKey="Rescued" stackId="a" fill={STATUS_COLORS.rescued} />}
          {selectedStatuses.includes('Cannot Contact') && <Bar dataKey="Cannot Contact" stackId="a" fill={STATUS_COLORS.cannotContact} />}
          {selectedStatuses.includes('Completed') && <Bar dataKey="Completed" stackId="a" fill={STATUS_COLORS.completed} />}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PriorityByDistrictChart({ data }: ChartsProps) {
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(['Critical', 'High', 'Medium', 'Low']);
  const [showFilter, setShowFilter] = useState(false);
  const [limit, setLimit] = useState(10);

  const allPriorities = ['Critical', 'High', 'Medium', 'Low'];

  const chartData = data.slice(0, limit).map((d) => ({
    name: d.district.length > 12 ? d.district.slice(0, 12) + '...' : d.district,
    Critical: d.critical,
    High: d.high,
    Medium: d.medium,
    Low: d.low,
  }));

  const togglePriority = (priority: string) => {
    setSelectedPriorities(prev => 
      prev.includes(priority) 
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    );
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Priority by District
        </h3>
        <button 
          onClick={() => setShowFilter(!showFilter)}
          className={`p-2 rounded-lg border transition-colors ${showFilter ? 'bg-slate-100 border-slate-300' : 'border-slate-200 hover:bg-slate-50'}`}
        >
          <Filter size={16} className="text-slate-600" />
        </button>
      </div>

      {showFilter && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex flex-wrap gap-2 mb-3">
            {allPriorities.map(priority => (
              <button
                key={priority}
                onClick={() => togglePriority(priority)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedPriorities.includes(priority)
                    ? 'text-white'
                    : 'bg-white border border-slate-300 text-slate-600'
                }`}
                style={selectedPriorities.includes(priority) ? { backgroundColor: PRIORITY_COLORS[priority.toLowerCase() as keyof typeof PRIORITY_COLORS] } : {}}
              >
                {priority}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-600">Show top:</label>
            <select 
              value={limit} 
              onChange={(e) => setLimit(Number(e.target.value))}
              className="px-2 py-1 text-xs border border-slate-300 rounded"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
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
          <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '20px' }} />
          {selectedPriorities.includes('Critical') && <Bar dataKey="Critical" fill={PRIORITY_COLORS.critical} />}
          {selectedPriorities.includes('High') && <Bar dataKey="High" fill={PRIORITY_COLORS.high} />}
          {selectedPriorities.includes('Medium') && <Bar dataKey="Medium" fill={PRIORITY_COLORS.medium} />}
          {selectedPriorities.includes('Low') && <Bar dataKey="Low" fill={PRIORITY_COLORS.low} />}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EmergencyTypePieChart({ data }: ChartsProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['Trapped', 'Food/Water', 'Medical', 'Rescue Assistance', 'Missing Person', 'Other']);
  const [showFilter, setShowFilter] = useState(false);

  const allTypes = ['Trapped', 'Food/Water', 'Medical', 'Rescue Assistance', 'Missing Person', 'Other'];

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
    .map(([name, value], index) => ({ name, value, color: EMERGENCY_COLORS[index] }))
    .filter((d) => d.value > 0 && selectedTypes.includes(d.name));

  const renderLabel = (props: { name?: string; percent?: number }) => 
    `${props.name ?? ''} (${((props.percent ?? 0) * 100).toFixed(0)}%)`;

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Emergency Types Distribution
        </h3>
        <button 
          onClick={() => setShowFilter(!showFilter)}
          className={`p-2 rounded-lg border transition-colors ${showFilter ? 'bg-slate-100 border-slate-300' : 'border-slate-200 hover:bg-slate-50'}`}
        >
          <Filter size={16} className="text-slate-600" />
        </button>
      </div>

      {showFilter && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex flex-wrap gap-2">
            {allTypes.map((type, index) => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedTypes.includes(type)
                    ? 'text-white'
                    : 'bg-white border border-slate-300 text-slate-600'
                }`}
                style={selectedTypes.includes(type) ? { backgroundColor: EMERGENCY_COLORS[index] } : {}}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="40%"
            labelLine={false}
            label={renderLabel}
            outerRadius={85}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
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
          <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PriorityPieChart({ data }: ChartsProps) {
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(['Critical', 'High', 'Medium', 'Low']);
  const [showFilter, setShowFilter] = useState(false);

  const allPriorities = ['Critical', 'High', 'Medium', 'Low'];
  const colors = [PRIORITY_COLORS.critical, PRIORITY_COLORS.high, PRIORITY_COLORS.medium, PRIORITY_COLORS.low];

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
    .map(([name, value], index) => ({ name, value, color: colors[index] }))
    .filter((d) => d.value > 0 && selectedPriorities.includes(d.name));

  const renderLabel = (props: { name?: string; percent?: number }) => 
    `${props.name ?? ''} (${((props.percent ?? 0) * 100).toFixed(0)}%)`;

  const togglePriority = (priority: string) => {
    setSelectedPriorities(prev => 
      prev.includes(priority) 
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    );
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Priority Distribution
        </h3>
        <button 
          onClick={() => setShowFilter(!showFilter)}
          className={`p-2 rounded-lg border transition-colors ${showFilter ? 'bg-slate-100 border-slate-300' : 'border-slate-200 hover:bg-slate-50'}`}
        >
          <Filter size={16} className="text-slate-600" />
        </button>
      </div>

      {showFilter && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex flex-wrap gap-2">
            {allPriorities.map((priority, index) => (
              <button
                key={priority}
                onClick={() => togglePriority(priority)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedPriorities.includes(priority)
                    ? 'text-white'
                    : 'bg-white border border-slate-300 text-slate-600'
                }`}
                style={selectedPriorities.includes(priority) ? { backgroundColor: colors[index] } : {}}
              >
                {priority}
              </button>
            ))}
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="40%"
            labelLine={false}
            label={renderLabel}
            outerRadius={85}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
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
          <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PeopleByDistrictChart({ data }: ChartsProps) {
  const [showFilter, setShowFilter] = useState(false);
  const [limit, setLimit] = useState(15);
  const [showPeople, setShowPeople] = useState(true);
  const [showCases, setShowCases] = useState(true);

  const chartData = data.slice(0, limit).map((d) => ({
    name: d.district.length > 10 ? d.district.slice(0, 10) + '...' : d.district,
    'Total People': d.totalPeople,
    'Total Cases': d.total,
  }));

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          People Affected by District
        </h3>
        <button 
          onClick={() => setShowFilter(!showFilter)}
          className={`p-2 rounded-lg border transition-colors ${showFilter ? 'bg-slate-100 border-slate-300' : 'border-slate-200 hover:bg-slate-50'}`}
        >
          <Filter size={16} className="text-slate-600" />
        </button>
      </div>

      {showFilter && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={() => setShowPeople(!showPeople)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                showPeople ? 'bg-blue-500 text-white' : 'bg-white border border-slate-300 text-slate-600'
              }`}
            >
              Total People
            </button>
            <button
              onClick={() => setShowCases(!showCases)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                showCases ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-300 text-slate-600'
              }`}
            >
              Total Cases
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-600">Show top:</label>
            <select 
              value={limit} 
              onChange={(e) => setLimit(Number(e.target.value))}
              className="px-2 py-1 text-xs border border-slate-300 rounded"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={25}>25</option>
            </select>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
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
          <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '20px' }} />
          {showPeople && <Bar dataKey="Total People" fill="#3b82f6" />}
          {showCases && <Bar dataKey="Total Cases" fill="#10b981" />}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function VulnerableGroupsChart({ data }: ChartsProps) {
  const [selectedGroups, setSelectedGroups] = useState<string[]>(['With Children', 'With Elderly', 'With Disabled', 'Medical Emergency']);
  const [showFilter, setShowFilter] = useState(false);

  const allGroups = ['With Children', 'With Elderly', 'With Disabled', 'Medical Emergency'];

  const totals = data.reduce(
    (acc, d) => ({
      'With Children': acc['With Children'] + d.hasChildren,
      'With Elderly': acc['With Elderly'] + d.hasElderly,
      'With Disabled': acc['With Disabled'] + d.hasDisabled,
      'Medical Emergency': acc['Medical Emergency'] + d.hasMedicalEmergency,
    }),
    { 'With Children': 0, 'With Elderly': 0, 'With Disabled': 0, 'Medical Emergency': 0 }
  );


  const chartData = Object.entries(totals)
    .filter(([name]) => selectedGroups.includes(name))
    .map(([name, value]) => ({ 
      name, 
      value,
      fill: VULNERABLE_COLORS[allGroups.indexOf(name)] 
    }));

  const toggleGroup = (group: string) => {
    setSelectedGroups(prev => 
      prev.includes(group) 
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };


  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Vulnerable Groups
        </h3>
        <button 
          onClick={() => setShowFilter(!showFilter)}
          className={`p-2 rounded-lg border transition-colors ${showFilter ? 'bg-slate-100 border-slate-300' : 'border-slate-200 hover:bg-slate-50'}`}
        >
          <Filter size={16} className="text-slate-600" />
        </button>
      </div>

      {showFilter && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex flex-wrap gap-2">
            {allGroups.map((group, index) => (
              <button
                key={group}
                onClick={() => toggleGroup(group)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedGroups.includes(group)
                    ? 'text-white'
                    : 'bg-white border border-slate-300 text-slate-600'
                }`}
                style={selectedGroups.includes(group) ? { backgroundColor: VULNERABLE_COLORS[index] } : {}}
              >
                {group}
              </button>
            ))}
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 120, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" tick={{ fill: '#64748b' }} />
          <YAxis dataKey="name" type="category" tick={{ fill: '#64748b' }} width={110} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }} 
          />

          <Bar dataKey="value">

            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Bubble chart color palette for emergency types
const BUBBLE_COLORS: Record<string, string> = {
  TRAPPED: '#8b5cf6',           // violet
  SHELTER_NEEDED: '#ef4444',    // red
  SHELTER_H: '#f97316',         // orange
  DRY_MATERIALS_H: '#eab308',   // yellow
  RESCUE_NEEDED: '#22c55e',     // green
  MEDICAL_ASSISTANCE_H: '#3b82f6', // blue
  OTHER: '#06b6d4',             // cyan
  MISSING_PERSON: '#ec4899',    // pink
  MEDICAL: '#14b8a6',           // teal
  FOOD_WATER: '#6366f1',        // indigo
  DRY_FOOD_H: '#f43f5e',        // rose
  DRINKING_WATER_H: '#a855f7',  // purple
  COOKED_FOOD_H: '#84cc16',     // lime
};

interface BubbleChartProps {
  records: SOSRecord[];
}

interface BubbleDataPoint {
  district: string;
  emergencyType: string;
  x: number;
  y: number;
  z: number;
  people: number;
  requests: number;
  color: string;
}

export function DistrictImpactBubbleChart({ records }: BubbleChartProps) {
  const [showFilter, setShowFilter] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Process records to create bubble data
  const { bubbleData, districts, emergencyTypes } = useMemo(() => {
    // Group records by district and emergency type
    const grouped: Record<string, Record<string, { people: number; requests: number }>> = {};
    const districtSet = new Set<string>();
    const typeSet = new Set<string>();

    records.forEach(record => {
      if (!record.district || !record.emergencyType) return;
      
      districtSet.add(record.district);
      typeSet.add(record.emergencyType);
      
      if (!grouped[record.district]) {
        grouped[record.district] = {};
      }
      if (!grouped[record.district][record.emergencyType]) {
        grouped[record.district][record.emergencyType] = { people: 0, requests: 0 };
      }
      
      grouped[record.district][record.emergencyType].people += record.numberOfPeople || 0;
      grouped[record.district][record.emergencyType].requests += 1;
    });

    const districts = Array.from(districtSet).sort();
    const emergencyTypes = Array.from(typeSet).sort();

    // Create bubble data points
    const data: BubbleDataPoint[] = [];
    
    districts.forEach((district, districtIndex) => {
      emergencyTypes.forEach((type, typeIndex) => {
        const stats = grouped[district]?.[type];
        if (stats && stats.requests > 0) {
          data.push({
            district,
            emergencyType: type,
            x: districtIndex,
            y: typeIndex,
            z: Math.sqrt(stats.people) * 3, // Scale bubble size
            people: stats.people,
            requests: stats.requests,
            color: BUBBLE_COLORS[type] || '#64748b',
          });
        }
      });
    });

    return { bubbleData: data, districts, emergencyTypes };
  }, [records]);

  // Initialize selected types with all types
  useMemo(() => {
    if (selectedTypes.length === 0 && emergencyTypes.length > 0) {
      setSelectedTypes(emergencyTypes);
    }
  }, [emergencyTypes, selectedTypes.length]);

  const filteredData = useMemo(() => {
    if (selectedTypes.length === 0) return bubbleData;
    return bubbleData.filter(d => selectedTypes.includes(d.emergencyType));
  }, [bubbleData, selectedTypes]);

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: BubbleDataPoint }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-800">{data.district}</p>
          <p className="text-sm text-slate-600">Type: {data.emergencyType.replace(/_/g, ' ')}</p>
          <p className="text-sm text-blue-600">People: {data.people.toLocaleString()}</p>
          <p className="text-sm text-emerald-600">Requests: {data.requests}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 lg:col-span-2">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            District Impact Clusters
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Comparing <span className="text-blue-600 font-medium">Districts</span> (X-Axis) vs{' '}
            <span className="text-purple-600 font-medium">Emergency Types</span> (Y-Axis).
            Bubble size = Number of people affected.
          </p>
        </div>
        <button 
          onClick={() => setShowFilter(!showFilter)}
          className={`p-2 rounded-lg border transition-colors ${showFilter ? 'bg-slate-100 border-slate-300' : 'border-slate-200 hover:bg-slate-50'}`}
        >
          <Filter size={16} className="text-slate-600" />
        </button>
      </div>

      {showFilter && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-600 mb-2">Filter by Emergency Type:</p>
          <div className="flex flex-wrap gap-2">
            {emergencyTypes.map(type => (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  selectedTypes.includes(type)
                    ? 'text-white'
                    : 'bg-white border border-slate-300 text-slate-600'
                }`}
                style={selectedTypes.includes(type) ? { backgroundColor: BUBBLE_COLORS[type] || '#64748b' } : {}}
              >
                {type.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => setSelectedTypes(emergencyTypes)}
              className="text-xs text-blue-600 hover:underline"
            >
              Select All
            </button>
            <button
              onClick={() => setSelectedTypes([])}
              className="text-xs text-red-600 hover:underline"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={450}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            type="number" 
            dataKey="x" 
            domain={[-0.5, districts.length - 0.5]}
            ticks={districts.map((_, i) => i)}
            tickFormatter={(value) => {
              const district = districts[value];
              return district ? (district.length > 10 ? district.slice(0, 10) + '...' : district) : '';
            }}
            angle={-45}
            textAnchor="end"
            interval={0}
            fontSize={10}
            tick={{ fill: '#64748b' }}
            height={80}
          />
          <YAxis 
            type="number" 
            dataKey="y"
            domain={[-0.5, emergencyTypes.length - 0.5]}
            ticks={emergencyTypes.map((_, i) => i)}
            tickFormatter={(value) => {
              const type = emergencyTypes[value];
              if (!type) return '';
              const formatted = type.replace(/_/g, ' ');
              return formatted.length > 18 ? formatted.slice(0, 18) + '...' : formatted;
            }}
            fontSize={9}
            tick={{ fill: '#475569' }}
            width={130}
          />
          <ZAxis type="number" dataKey="z" range={[20, 800]} />
          <Tooltip content={<CustomTooltip />} />
          <Scatter 
            data={filteredData} 
            fill="#8884d8"
          >
            {filteredData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                fillOpacity={0.7}
                stroke={entry.color}
                strokeWidth={1}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-2 pt-2 border-t border-slate-200">
        <p className="text-xs text-slate-500 mb-1">Emergency Types:</p>
        <div className="flex flex-wrap gap-2">
          {emergencyTypes.slice(0, 10).map(type => (
            <div key={type} className="flex items-center gap-1.5">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: BUBBLE_COLORS[type] || '#64748b' }}
              />
              <span className="text-xs text-slate-600">{type.replace(/_/g, ' ')}</span>
            </div>
          ))}
          {emergencyTypes.length > 10 && (
            <span className="text-xs text-slate-400">+{emergencyTypes.length - 10} more</span>
          )}
        </div>
      </div>
    </div>
  );
}
