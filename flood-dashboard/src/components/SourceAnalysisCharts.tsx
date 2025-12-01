'use client';

import { useState, useMemo } from 'react';
import { SOSRecord } from '@/types';
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
  AreaChart,
  Area,
} from 'recharts';
import { Filter, Smartphone, Globe, MessageSquare, Users, CheckCircle } from 'lucide-react';

// Source colors - distinct and accessible
const SOURCE_COLORS: Record<string, string> = {
  WEB: '#3b82f6',           // blue
  SMS: '#10b981',           // emerald
  HELAKURU_APP: '#8b5cf6',  // violet
  PUBLIC: '#f59e0b',        // amber
  OTHER: '#64748b',         // slate
};

const SOURCE_LABELS: Record<string, string> = {
  WEB: 'Web Portal',
  SMS: 'SMS',
  HELAKURU_APP: 'Helakuru App',
  PUBLIC: 'Public',
};

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  WEB: <Globe size={16} />,
  SMS: <MessageSquare size={16} />,
  HELAKURU_APP: <Smartphone size={16} />,
  PUBLIC: <Users size={16} />,
};

interface SourceAnalysisProps {
  records: SOSRecord[];
}

// Source Distribution Pie Chart
export function SourceDistributionChart({ records }: SourceAnalysisProps) {
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach(r => {
      const source = r.source || 'OTHER';
      counts[source] = (counts[source] || 0) + 1;
    });
    
    return Object.entries(counts)
      .map(([source, count]) => ({
        name: SOURCE_LABELS[source] || source,
        value: count,
        source,
        percentage: ((count / records.length) * 100).toFixed(1),
      }))
      .sort((a, b) => b.value - a.value);
  }, [records]);

  const total = records.length;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 md:p-6">
      <h3 className="text-xs md:text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
        SOS Requests by Source
      </h3>
      <div className="h-[280px] md:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={SOURCE_COLORS[entry.source] || SOURCE_COLORS.OTHER} 
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number, name: string) => [
                `${value.toLocaleString()} (${((value / total) * 100).toFixed(1)}%)`,
                name
              ]}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
            />
            <Legend 
              verticalAlign="bottom"
              height={36}
              formatter={(value) => {
                const item = chartData.find(d => d.name === value);
                return `${value}: ${item ? item.value.toLocaleString() : ''} (${item ? ((item.value / total) * 100).toFixed(1) : 0}%)`;
              }}
              wrapperStyle={{ fontSize: '11px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-center text-sm text-slate-500">
        Total: {total.toLocaleString()} requests
      </div>
    </div>
  );
}

// Source Stats Cards
export function SourceStatsCards({ records }: SourceAnalysisProps) {
  const stats = useMemo(() => {
    const sourceStats: Record<string, { 
      count: number; 
      people: number; 
      rescued: number; 
      critical: number;
      pending: number;
    }> = {};
    
    records.forEach(r => {
      const source = r.source || 'OTHER';
      if (!sourceStats[source]) {
        sourceStats[source] = { count: 0, people: 0, rescued: 0, critical: 0, pending: 0 };
      }
      sourceStats[source].count++;
      sourceStats[source].people += r.numberOfPeople || 0;
      if (r.status === 'RESCUED') sourceStats[source].rescued++;
      if (r.priority === 'CRITICAL' || r.priority === 'HIGHLY_CRITICAL') sourceStats[source].critical++;
      if (r.status === 'PENDING') sourceStats[source].pending++;
    });
    
    return Object.entries(sourceStats)
      .map(([source, data]) => ({
        source,
        label: SOURCE_LABELS[source] || source,
        icon: SOURCE_ICONS[source],
        color: SOURCE_COLORS[source] || SOURCE_COLORS.OTHER,
        ...data,
        rescueRate: data.count > 0 ? ((data.rescued / data.count) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.count - a.count);
  }, [records]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {stats.map(stat => (
        <div 
          key={stat.source}
          className="bg-white rounded-xl border border-slate-200 p-3 md:p-4 shadow-sm"
          style={{ borderLeftColor: stat.color, borderLeftWidth: '4px' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span style={{ color: stat.color }}>{stat.icon}</span>
            <span className="text-xs md:text-sm font-semibold text-slate-700 truncate">{stat.label}</span>
          </div>
          <div className="text-xl md:text-2xl font-bold text-slate-800">
            {stat.count.toLocaleString()}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1 text-[10px] md:text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Users size={10} className="md:w-3 md:h-3" />
              <span>{stat.people.toLocaleString()} people</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle size={10} className="md:w-3 md:h-3 text-green-500" />
              <span>{stat.rescueRate}% rescued</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Status by Source Bar Chart
export function StatusBySourceChart({ records }: SourceAnalysisProps) {
  const [showFilter, setShowFilter] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState(['PENDING', 'VERIFIED', 'RESCUED', 'CANNOT_CONTACT']);

  const allStatuses = ['PENDING', 'VERIFIED', 'RESCUED', 'CANNOT_CONTACT', 'COMPLETED', 'IN_PROGRESS'];

  const chartData = useMemo(() => {
    const sourceStatusMap: Record<string, Record<string, number>> = {};
    
    records.forEach(r => {
      const source = r.source || 'OTHER';
      if (!sourceStatusMap[source]) {
        sourceStatusMap[source] = {};
      }
      const status = r.status || 'UNKNOWN';
      sourceStatusMap[source][status] = (sourceStatusMap[source][status] || 0) + 1;
    });
    
    return Object.entries(sourceStatusMap)
      .map(([source, statuses]) => ({
        name: SOURCE_LABELS[source] || source,
        source,
        ...statuses,
      }))
      .sort((a, b) => {
        const totalA = Object.values(a).filter(v => typeof v === 'number').reduce((sum, v) => sum + (v as number), 0);
        const totalB = Object.values(b).filter(v => typeof v === 'number').reduce((sum, v) => sum + (v as number), 0);
        return totalB - totalA;
      });
  }, [records]);

  const STATUS_COLORS_MAP: Record<string, string> = {
    PENDING: '#f59e0b',
    VERIFIED: '#3b82f6',
    RESCUED: '#10b981',
    CANNOT_CONTACT: '#ef4444',
    COMPLETED: '#8b5cf6',
    IN_PROGRESS: '#06b6d4',
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs md:text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Status Distribution by Source
        </h3>
        <button 
          onClick={() => setShowFilter(!showFilter)}
          className={`p-1.5 md:p-2 rounded-lg border transition-colors ${showFilter ? 'bg-slate-100 border-slate-300' : 'border-slate-200 hover:bg-slate-50'}`}
        >
          <Filter size={14} className="md:w-4 md:h-4 text-slate-600" />
        </button>
      </div>
      
      {showFilter && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-600 mb-2">Show statuses:</p>
          <div className="flex flex-wrap gap-2">
            {allStatuses.map(status => (
              <button
                key={status}
                onClick={() => toggleStatus(status)}
                className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                  selectedStatuses.includes(status)
                    ? 'text-white'
                    : 'bg-white text-slate-600 border-slate-300'
                }`}
                style={selectedStatuses.includes(status) ? { backgroundColor: STATUS_COLORS_MAP[status] } : {}}
              >
                {status.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="h-[250px] md:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              formatter={(value: number, name: string) => [value.toLocaleString(), name.replace(/_/g, ' ')]}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            {selectedStatuses.map(status => (
              <Bar 
                key={status}
                dataKey={status}
                name={status.replace(/_/g, ' ')}
                stackId="a"
                fill={STATUS_COLORS_MAP[status] || '#64748b'}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Priority by Source Chart
export function PriorityBySourceChart({ records }: SourceAnalysisProps) {
  const chartData = useMemo(() => {
    const sourcePriorityMap: Record<string, Record<string, number>> = {};
    
    records.forEach(r => {
      const source = r.source || 'OTHER';
      if (!sourcePriorityMap[source]) {
        sourcePriorityMap[source] = {};
      }
      const priority = r.priority || 'UNKNOWN';
      sourcePriorityMap[source][priority] = (sourcePriorityMap[source][priority] || 0) + 1;
    });
    
    return Object.entries(sourcePriorityMap)
      .map(([source, priorities]) => ({
        name: SOURCE_LABELS[source] || source,
        source,
        ...priorities,
      }))
      .sort((a, b) => {
        const aData = a as Record<string, unknown>;
        const bData = b as Record<string, unknown>;
        const totalA = ((aData.CRITICAL as number) || 0) + ((aData.HIGHLY_CRITICAL as number) || 0);
        const totalB = ((bData.CRITICAL as number) || 0) + ((bData.HIGHLY_CRITICAL as number) || 0);
        return totalB - totalA;
      });
  }, [records]);

  const PRIORITY_COLORS_MAP: Record<string, string> = {
    HIGHLY_CRITICAL: '#7f1d1d',
    CRITICAL: '#dc2626',
    HIGH: '#f97316',
    MEDIUM: '#eab308',
    LOW: '#22c55e',
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 md:p-6">
      <h3 className="text-xs md:text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
        Priority Distribution by Source
      </h3>
      <div className="h-[250px] md:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              formatter={(value: number, name: string) => [value.toLocaleString(), name]}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="HIGHLY_CRITICAL" name="Highly Critical" stackId="a" fill={PRIORITY_COLORS_MAP.HIGHLY_CRITICAL} />
            <Bar dataKey="CRITICAL" name="Critical" stackId="a" fill={PRIORITY_COLORS_MAP.CRITICAL} />
            <Bar dataKey="HIGH" name="High" stackId="a" fill={PRIORITY_COLORS_MAP.HIGH} />
            <Bar dataKey="MEDIUM" name="Medium" stackId="a" fill={PRIORITY_COLORS_MAP.MEDIUM} />
            <Bar dataKey="LOW" name="Low" stackId="a" fill={PRIORITY_COLORS_MAP.LOW} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Source Over Time Chart
export function SourceOverTimeChart({ records }: SourceAnalysisProps) {
  const [timeRange, setTimeRange] = useState<'all' | '7d' | '24h'>('all');

  const chartData = useMemo(() => {
    const now = new Date();
    const filtered = records.filter(r => {
      if (!r.createdAt) return false;
      const date = new Date(r.createdAt);
      if (timeRange === '24h') return (now.getTime() - date.getTime()) <= 24 * 60 * 60 * 1000;
      if (timeRange === '7d') return (now.getTime() - date.getTime()) <= 7 * 24 * 60 * 60 * 1000;
      return true;
    });

    const groupedByDate: Record<string, Record<string, number>> = {};
    
    filtered.forEach(r => {
      if (!r.createdAt) return;
      const date = new Date(r.createdAt);
      let key: string;
      
      if (timeRange === '24h') {
        key = date.toLocaleTimeString('en-US', { hour: '2-digit', hour12: true });
      } else {
        key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      
      if (!groupedByDate[key]) {
        groupedByDate[key] = { WEB: 0, SMS: 0, HELAKURU_APP: 0, PUBLIC: 0, OTHER: 0 };
      }
      
      const source = r.source || 'OTHER';
      groupedByDate[key][source] = (groupedByDate[key][source] || 0) + 1;
    });
    
    return Object.entries(groupedByDate)
      .map(([date, sources]) => ({
        date,
        ...sources,
      }));
  }, [records, timeRange]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h3 className="text-xs md:text-sm font-semibold text-slate-700 uppercase tracking-wide">
          SOS Submissions Over Time by Source
        </h3>
        <div className="flex gap-1">
          {(['all', '7d', '24h'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                timeRange === range 
                  ? 'bg-slate-800 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {range === 'all' ? 'All' : range === '7d' ? '7 Days' : '24h'}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[250px] md:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              formatter={(value: number, name: string) => [value, SOURCE_LABELS[name] || name]}
            />
            <Legend 
              wrapperStyle={{ fontSize: '11px' }}
              formatter={(value) => SOURCE_LABELS[value] || value}
            />
            <Area type="monotone" dataKey="WEB" stackId="1" stroke={SOURCE_COLORS.WEB} fill={SOURCE_COLORS.WEB} fillOpacity={0.6} />
            <Area type="monotone" dataKey="SMS" stackId="1" stroke={SOURCE_COLORS.SMS} fill={SOURCE_COLORS.SMS} fillOpacity={0.6} />
            <Area type="monotone" dataKey="HELAKURU_APP" stackId="1" stroke={SOURCE_COLORS.HELAKURU_APP} fill={SOURCE_COLORS.HELAKURU_APP} fillOpacity={0.6} />
            <Area type="monotone" dataKey="PUBLIC" stackId="1" stroke={SOURCE_COLORS.PUBLIC} fill={SOURCE_COLORS.PUBLIC} fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Emergency Types by Source
export function EmergencyTypesBySourceChart({ records }: SourceAnalysisProps) {
  const chartData = useMemo(() => {
    const sourceEmergencyMap: Record<string, Record<string, number>> = {};
    
    records.forEach(r => {
      const source = r.source || 'OTHER';
      if (!sourceEmergencyMap[source]) {
        sourceEmergencyMap[source] = {};
      }
      const emergencyType = r.emergencyType || 'OTHER';
      sourceEmergencyMap[source][emergencyType] = (sourceEmergencyMap[source][emergencyType] || 0) + 1;
    });
    
    return Object.entries(sourceEmergencyMap)
      .map(([source, types]) => ({
        name: SOURCE_LABELS[source] || source,
        source,
        ...types,
      }))
      .sort((a, b) => {
        const totalA = Object.values(a).filter(v => typeof v === 'number').reduce((sum, v) => sum + (v as number), 0);
        const totalB = Object.values(b).filter(v => typeof v === 'number').reduce((sum, v) => sum + (v as number), 0);
        return totalB - totalA;
      });
  }, [records]);

  const EMERGENCY_COLORS_MAP: Record<string, string> = {
    TRAPPED: '#ef4444',
    FOOD_WATER: '#f97316',
    MEDICAL: '#3b82f6',
    RESCUE_ASSISTANCE: '#8b5cf6',
    MISSING_PERSON: '#06b6d4',
    OTHER: '#64748b',
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 md:p-6">
      <h3 className="text-xs md:text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
        Emergency Types by Source
      </h3>
      <div className="h-[250px] md:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              formatter={(value: number, name: string) => [value.toLocaleString(), name.replace(/_/g, ' ')]}
            />
            <Legend wrapperStyle={{ fontSize: '10px' }} formatter={(value) => value.replace(/_/g, ' ')} />
            <Bar dataKey="TRAPPED" name="TRAPPED" stackId="a" fill={EMERGENCY_COLORS_MAP.TRAPPED} />
            <Bar dataKey="FOOD_WATER" name="FOOD_WATER" stackId="a" fill={EMERGENCY_COLORS_MAP.FOOD_WATER} />
            <Bar dataKey="MEDICAL" name="MEDICAL" stackId="a" fill={EMERGENCY_COLORS_MAP.MEDICAL} />
            <Bar dataKey="RESCUE_ASSISTANCE" name="RESCUE_ASSISTANCE" stackId="a" fill={EMERGENCY_COLORS_MAP.RESCUE_ASSISTANCE} />
            <Bar dataKey="MISSING_PERSON" name="MISSING_PERSON" stackId="a" fill={EMERGENCY_COLORS_MAP.MISSING_PERSON} />
            <Bar dataKey="OTHER" name="OTHER" stackId="a" fill={EMERGENCY_COLORS_MAP.OTHER} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// People Affected by Source
export function PeopleBySourceChart({ records }: SourceAnalysisProps) {
  const chartData = useMemo(() => {
    const sourceData: Record<string, { people: number; count: number }> = {};
    
    records.forEach(r => {
      const source = r.source || 'OTHER';
      if (!sourceData[source]) {
        sourceData[source] = { people: 0, count: 0 };
      }
      sourceData[source].people += r.numberOfPeople || 0;
      sourceData[source].count++;
    });
    
    return Object.entries(sourceData)
      .map(([source, data]) => ({
        name: SOURCE_LABELS[source] || source,
        source,
        people: data.people,
        requests: data.count,
        avgPeople: data.count > 0 ? (data.people / data.count).toFixed(1) : 0,
      }))
      .sort((a, b) => b.people - a.people);
  }, [records]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 md:p-6">
      <h3 className="text-xs md:text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">
        People Affected by Source
      </h3>
      <div className="h-[250px] md:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              formatter={(value: number, name: string) => [value.toLocaleString(), name]}
              labelFormatter={(label) => `Source: ${label}`}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="people" name="People Affected" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        {chartData.map(item => (
          <div key={item.source} className="text-center p-2 bg-slate-50 rounded-lg">
            <div className="text-xs text-slate-500">{item.name}</div>
            <div className="text-sm font-semibold text-slate-700">~{item.avgPeople} ppl/req</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Source Comparison Table
export function SourceComparisonTable({ records }: SourceAnalysisProps) {
  const tableData = useMemo(() => {
    const sourceStats: Record<string, {
      total: number;
      people: number;
      critical: number;
      rescued: number;
      pending: number;
      verified: number;
      cannotContact: number;
      withChildren: number;
      withElderly: number;
      withMedical: number;
    }> = {};
    
    records.forEach(r => {
      const source = r.source || 'OTHER';
      if (!sourceStats[source]) {
        sourceStats[source] = {
          total: 0, people: 0, critical: 0, rescued: 0, pending: 0,
          verified: 0, cannotContact: 0, withChildren: 0, withElderly: 0, withMedical: 0,
        };
      }
      const s = sourceStats[source];
      s.total++;
      s.people += r.numberOfPeople || 0;
      if (r.priority === 'CRITICAL' || r.priority === 'HIGHLY_CRITICAL') s.critical++;
      if (r.status === 'RESCUED') s.rescued++;
      if (r.status === 'PENDING') s.pending++;
      if (r.status === 'VERIFIED') s.verified++;
      if (r.status === 'CANNOT_CONTACT') s.cannotContact++;
      if (r.hasChildren) s.withChildren++;
      if (r.hasElderly) s.withElderly++;
      if (r.hasMedicalEmergency) s.withMedical++;
    });
    
    return Object.entries(sourceStats)
      .map(([source, stats]) => ({
        source,
        label: SOURCE_LABELS[source] || source,
        color: SOURCE_COLORS[source] || SOURCE_COLORS.OTHER,
        ...stats,
        rescueRate: stats.total > 0 ? ((stats.rescued / stats.total) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.total - a.total);
  }, [records]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="p-3 md:p-4 border-b border-slate-200 bg-slate-50">
        <h3 className="text-xs md:text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Source Comparison Summary
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">Source</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">Total</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">People</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600 hidden md:table-cell">Critical</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">Rescued</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600 hidden md:table-cell">Pending</th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-slate-600">Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tableData.map(row => (
              <tr key={row.source} className="hover:bg-slate-50">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: row.color }}
                    />
                    <span className="font-medium text-slate-700">{row.label}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-right font-semibold">{row.total.toLocaleString()}</td>
                <td className="px-3 py-2 text-right">{row.people.toLocaleString()}</td>
                <td className="px-3 py-2 text-right text-red-600 hidden md:table-cell">{row.critical}</td>
                <td className="px-3 py-2 text-right text-green-600">{row.rescued}</td>
                <td className="px-3 py-2 text-right text-amber-600 hidden md:table-cell">{row.pending}</td>
                <td className="px-3 py-2 text-right">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    parseFloat(row.rescueRate) > 10 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {row.rescueRate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Districts by Source
export function DistrictsBySourceChart({ records }: SourceAnalysisProps) {
  const [selectedSource, setSelectedSource] = useState<string>('all');
  
  const sources = useMemo(() => {
    const uniqueSources = new Set(records.map(r => r.source || 'OTHER'));
    return ['all', ...Array.from(uniqueSources)];
  }, [records]);

  const chartData = useMemo(() => {
    const filtered = selectedSource === 'all' 
      ? records 
      : records.filter(r => (r.source || 'OTHER') === selectedSource);
    
    const districtCounts: Record<string, number> = {};
    filtered.forEach(r => {
      const district = r.district || 'Unknown';
      districtCounts[district] = (districtCounts[district] || 0) + 1;
    });
    
    return Object.entries(districtCounts)
      .map(([district, count]) => ({ district, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [records, selectedSource]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h3 className="text-xs md:text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Top Districts by Source
        </h3>
        <select
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value)}
          className="px-2 py-1 text-xs md:text-sm border border-slate-300 rounded-lg bg-white"
        >
          {sources.map(source => (
            <option key={source} value={source}>
              {source === 'all' ? 'All Sources' : SOURCE_LABELS[source] || source}
            </option>
          ))}
        </select>
      </div>
      <div className="h-[250px] md:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis 
              dataKey="district" 
              type="category" 
              tick={{ fontSize: 10 }} 
              width={80}
              tickFormatter={(value) => value.length > 12 ? value.slice(0, 12) + '...' : value}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              formatter={(value: number) => [value.toLocaleString(), 'Requests']}
            />
            <Bar 
              dataKey="count" 
              fill={selectedSource === 'all' ? '#3b82f6' : (SOURCE_COLORS[selectedSource] || '#3b82f6')}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
