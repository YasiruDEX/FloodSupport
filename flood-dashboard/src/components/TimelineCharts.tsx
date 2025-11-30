'use client';

import { useState, useMemo } from 'react';
import { SOSRecord } from '@/types';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Filter, TrendingUp, Activity, Calendar, Clock } from 'lucide-react';

// Color palette for time series
const TIMELINE_COLORS = {
  sos: '#3b82f6',        // blue - SOS submissions
  rescued: '#10b981',    // emerald - Rescues completed
  pending: '#f59e0b',    // amber - Pending cases
  critical: '#ef4444',   // red - Critical priority
  verified: '#8b5cf6',   // violet - Verified
};

const DISTRICT_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
];

interface TimelineChartsProps {
  records: SOSRecord[];
}

// Helper function to format date
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Helper to get date key (YYYY-MM-DD)
const getDateKey = (dateStr: string | null | undefined) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  return date.toISOString().split('T')[0];
};

// Helper to get hour key (YYYY-MM-DD HH:00)
const getHourKey = (dateStr: string | null | undefined) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  date.setMinutes(0, 0, 0);
  return date.toISOString().slice(0, 13);
};

// ============================================
// SOS Submissions Over Time Chart
// ============================================
export function SOSOverTimeChart({ records }: TimelineChartsProps) {
  const [timeRange, setTimeRange] = useState<'all' | '7d' | '24h'>('all');
  const [showFilter, setShowFilter] = useState(false);
  const [viewMode, setViewMode] = useState<'daily' | 'hourly' | 'cumulative'>('daily');

  const chartData = useMemo(() => {
    let filteredRecords = records.filter(r => r.createdAt);
    
    // Apply time range filter
    const now = new Date();
    if (timeRange === '24h') {
      const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      filteredRecords = filteredRecords.filter(r => new Date(r.createdAt!) >= cutoff);
    } else if (timeRange === '7d') {
      const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredRecords = filteredRecords.filter(r => new Date(r.createdAt!) >= cutoff);
    }

    if (viewMode === 'hourly') {
      // Group by hour
      const hourlyMap = new Map<string, number>();
      filteredRecords.forEach(r => {
        const key = getHourKey(r.createdAt);
        if (key) {
          hourlyMap.set(key, (hourlyMap.get(key) || 0) + 1);
        }
      });
      
      return Array.from(hourlyMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([hour, count]) => ({
          time: new Date(hour + ':00:00Z').toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit'
          }),
          count,
        }));
    } else if (viewMode === 'cumulative') {
      // Cumulative view
      const dailyMap = new Map<string, number>();
      filteredRecords.forEach(r => {
        const key = getDateKey(r.createdAt);
        if (key) {
          dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
        }
      });
      
      const sorted = Array.from(dailyMap.entries()).sort(([a], [b]) => a.localeCompare(b));
      let cumulative = 0;
      return sorted.map(([date, count]) => {
        cumulative += count;
        return {
          time: formatDate(date),
          count,
          cumulative,
        };
      });
    } else {
      // Daily view
      const dailyMap = new Map<string, number>();
      filteredRecords.forEach(r => {
        const key = getDateKey(r.createdAt);
        if (key) {
          dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
        }
      });
      
      return Array.from(dailyMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({
          time: formatDate(date),
          count,
        }));
    }
  }, [records, timeRange, viewMode]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 md:p-6">
      <div className="flex items-center justify-between mb-2 md:mb-4">
        <h3 className="text-xs md:text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
          <TrendingUp size={16} className="text-blue-500" />
          SOS Submissions Over Time
        </h3>
        <button 
          onClick={() => setShowFilter(!showFilter)}
          className={`p-1.5 md:p-2 rounded-lg border transition-colors ${showFilter ? 'bg-slate-100 border-slate-300' : 'border-slate-200 hover:bg-slate-50'}`}
        >
          <Filter size={14} className="md:w-4 md:h-4 text-slate-600" />
        </button>
      </div>

      {showFilter && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-medium text-slate-600">Time Range:</span>
            {(['all', '7d', '24h'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2 py-1 text-xs rounded ${timeRange === range ? 'bg-slate-800 text-white' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'}`}
              >
                {range === 'all' ? 'All Time' : range === '7d' ? 'Last 7 Days' : 'Last 24 Hours'}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-medium text-slate-600">View Mode:</span>
            {(['daily', 'hourly', 'cumulative'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2 py-1 text-xs rounded capitalize ${viewMode === mode ? 'bg-slate-800 text-white' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'}`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="h-[280px] md:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'cumulative' ? (
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10 }} 
                angle={-45} 
                textAnchor="end" 
                height={60}
                stroke="#64748b"
              />
              <YAxis tick={{ fontSize: 10 }} stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area 
                type="monotone" 
                dataKey="cumulative" 
                name="Total Cumulative" 
                stroke={TIMELINE_COLORS.sos} 
                fill={TIMELINE_COLORS.sos}
                fillOpacity={0.3}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                name="Daily New" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={{ fill: '#f59e0b', strokeWidth: 0, r: 3 }}
              />
            </AreaChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10 }} 
                angle={-45} 
                textAnchor="end" 
                height={60}
                stroke="#64748b"
              />
              <YAxis tick={{ fontSize: 10 }} stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Bar 
                dataKey="count" 
                name="SOS Submissions" 
                fill={TIMELINE_COLORS.sos}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-3 text-xs text-slate-500 text-center">
        {chartData.length > 0 && (
          <span>
            Showing {chartData.length} data points • Peak: {Math.max(...chartData.map(d => d.count))} submissions
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================
// Rescues Over Time Chart
// ============================================
export function RescuesOverTimeChart({ records }: TimelineChartsProps) {
  const [timeRange, setTimeRange] = useState<'all' | '7d' | '24h'>('all');
  const [showFilter, setShowFilter] = useState(false);

  const chartData = useMemo(() => {
    // Get records with rescue timestamps (rescuedAt or completedAt or status is RESCUED/COMPLETED)
    let rescuedRecords = records.filter(r => 
      r.rescuedAt || r.completedAt || r.status === 'RESCUED' || r.status === 'COMPLETED'
    );

    const now = new Date();
    if (timeRange === '24h') {
      const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      rescuedRecords = rescuedRecords.filter(r => {
        const date = r.rescuedAt || r.completedAt || r.updatedAt;
        return date && new Date(date) >= cutoff;
      });
    } else if (timeRange === '7d') {
      const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      rescuedRecords = rescuedRecords.filter(r => {
        const date = r.rescuedAt || r.completedAt || r.updatedAt;
        return date && new Date(date) >= cutoff;
      });
    }

    // Group by date
    const dailyMap = new Map<string, { rescued: number; completed: number }>();
    rescuedRecords.forEach(r => {
      const date = r.rescuedAt || r.completedAt || r.updatedAt;
      const key = getDateKey(date);
      if (key) {
        const current = dailyMap.get(key) || { rescued: 0, completed: 0 };
        if (r.status === 'RESCUED') {
          current.rescued += 1;
        } else if (r.status === 'COMPLETED') {
          current.completed += 1;
        }
        dailyMap.set(key, current);
      }
    });

    return Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, counts]) => ({
        time: formatDate(date),
        rescued: counts.rescued,
        completed: counts.completed,
        total: counts.rescued + counts.completed,
      }));
  }, [records, timeRange]);

  const totalRescued = chartData.reduce((sum, d) => sum + d.rescued, 0);
  const totalCompleted = chartData.reduce((sum, d) => sum + d.completed, 0);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 md:p-6">
      <div className="flex items-center justify-between mb-2 md:mb-4">
        <h3 className="text-xs md:text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
          <Activity size={16} className="text-emerald-500" />
          Rescue Progress Over Time
        </h3>
        <button 
          onClick={() => setShowFilter(!showFilter)}
          className={`p-1.5 md:p-2 rounded-lg border transition-colors ${showFilter ? 'bg-slate-100 border-slate-300' : 'border-slate-200 hover:bg-slate-50'}`}
        >
          <Filter size={14} className="md:w-4 md:h-4 text-slate-600" />
        </button>
      </div>

      {showFilter && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-medium text-slate-600">Time Range:</span>
            {(['all', '7d', '24h'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2 py-1 text-xs rounded ${timeRange === range ? 'bg-slate-800 text-white' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'}`}
              >
                {range === 'all' ? 'All Time' : range === '7d' ? 'Last 7 Days' : 'Last 24 Hours'}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="h-[280px] md:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10 }} 
              angle={-45} 
              textAnchor="end" 
              height={60}
              stroke="#64748b"
            />
            <YAxis tick={{ fontSize: 10 }} stroke="#64748b" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Area 
              type="monotone" 
              dataKey="rescued" 
              name="Rescued" 
              stroke={TIMELINE_COLORS.rescued} 
              fill={TIMELINE_COLORS.rescued}
              fillOpacity={0.4}
              stackId="1"
            />
            <Area 
              type="monotone" 
              dataKey="completed" 
              name="Completed" 
              stroke="#8b5cf6" 
              fill="#8b5cf6"
              fillOpacity={0.4}
              stackId="1"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex justify-center gap-6 text-xs">
        <span className="text-emerald-600 font-medium">Total Rescued: {totalRescued}</span>
        <span className="text-violet-600 font-medium">Total Completed: {totalCompleted}</span>
      </div>
    </div>
  );
}

// ============================================
// Status Changes Over Time
// ============================================
export function StatusTimelineChart({ records }: TimelineChartsProps) {
  const [showFilter, setShowFilter] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['PENDING', 'VERIFIED', 'RESCUED']);

  const allStatuses = ['PENDING', 'VERIFIED', 'RESCUED', 'COMPLETED', 'CANNOT_CONTACT'];
  const statusColors: Record<string, string> = {
    PENDING: '#f59e0b',
    VERIFIED: '#3b82f6',
    RESCUED: '#10b981',
    COMPLETED: '#8b5cf6',
    CANNOT_CONTACT: '#ef4444',
  };

  const chartData = useMemo(() => {
    const dailyMap = new Map<string, Record<string, number>>();
    
    records.forEach(r => {
      const key = getDateKey(r.createdAt);
      if (key && r.status) {
        const current = dailyMap.get(key) || {};
        current[r.status] = (current[r.status] || 0) + 1;
        dailyMap.set(key, current);
      }
    });

    return Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, statuses]) => ({
        time: formatDate(date),
        ...statuses,
      }));
  }, [records]);

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 md:p-6">
      <div className="flex items-center justify-between mb-2 md:mb-4">
        <h3 className="text-xs md:text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
          <Calendar size={16} className="text-violet-500" />
          Daily Status Distribution
        </h3>
        <button 
          onClick={() => setShowFilter(!showFilter)}
          className={`p-1.5 md:p-2 rounded-lg border transition-colors ${showFilter ? 'bg-slate-100 border-slate-300' : 'border-slate-200 hover:bg-slate-50'}`}
        >
          <Filter size={14} className="md:w-4 md:h-4 text-slate-600" />
        </button>
      </div>

      {showFilter && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-xs font-medium text-slate-600 block mb-2">Show/Hide Status:</span>
          <div className="flex flex-wrap gap-2">
            {allStatuses.map(status => (
              <button
                key={status}
                onClick={() => toggleStatus(status)}
                className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                  selectedStatuses.includes(status) 
                    ? 'text-white' 
                    : 'bg-white border border-slate-300 text-slate-400'
                }`}
                style={{ 
                  backgroundColor: selectedStatuses.includes(status) ? statusColors[status] : undefined 
                }}
              >
                {status.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="h-[280px] md:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10 }} 
              angle={-45} 
              textAnchor="end" 
              height={60}
              stroke="#64748b"
            />
            <YAxis tick={{ fontSize: 10 }} stroke="#64748b" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            {selectedStatuses.map((status) => (
              <Area
                key={status}
                type="monotone"
                dataKey={status}
                name={status.replace(/_/g, ' ')}
                stroke={statusColors[status]}
                fill={statusColors[status]}
                fillOpacity={0.3}
                stackId="1"
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ============================================
// District Activity Over Time
// ============================================
export function DistrictActivityChart({ records }: TimelineChartsProps) {
  const [showFilter, setShowFilter] = useState(false);
  const [topN, setTopN] = useState(5);

  // Get top N districts by total records
  const topDistricts = useMemo(() => {
    const districtCounts = new Map<string, number>();
    records.forEach(r => {
      if (r.district) {
        districtCounts.set(r.district, (districtCounts.get(r.district) || 0) + 1);
      }
    });
    return Array.from(districtCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([d]) => d);
  }, [records, topN]);

  const chartData = useMemo(() => {
    const dailyMap = new Map<string, Record<string, number>>();
    
    records.forEach(r => {
      const key = getDateKey(r.createdAt);
      if (key && r.district && topDistricts.includes(r.district)) {
        const current = dailyMap.get(key) || {};
        current[r.district] = (current[r.district] || 0) + 1;
        dailyMap.set(key, current);
      }
    });

    return Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, districts]) => ({
        time: formatDate(date),
        ...districts,
      }));
  }, [records, topDistricts]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 md:p-6">
      <div className="flex items-center justify-between mb-2 md:mb-4">
        <h3 className="text-xs md:text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
          <TrendingUp size={16} className="text-orange-500" />
          District Activity Over Time (Top {topN})
        </h3>
        <button 
          onClick={() => setShowFilter(!showFilter)}
          className={`p-1.5 md:p-2 rounded-lg border transition-colors ${showFilter ? 'bg-slate-100 border-slate-300' : 'border-slate-200 hover:bg-slate-50'}`}
        >
          <Filter size={14} className="md:w-4 md:h-4 text-slate-600" />
        </button>
      </div>

      {showFilter && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-600">Show Top:</span>
            {[3, 5, 8, 10].map(n => (
              <button
                key={n}
                onClick={() => setTopN(n)}
                className={`px-2 py-1 text-xs rounded ${topN === n ? 'bg-slate-800 text-white' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'}`}
              >
                {n} Districts
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="h-[280px] md:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10 }} 
              angle={-45} 
              textAnchor="end" 
              height={60}
              stroke="#64748b"
            />
            <YAxis tick={{ fontSize: 10 }} stroke="#64748b" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            {topDistricts.map((district, index) => (
              <Line
                key={district}
                type="monotone"
                dataKey={district}
                name={district}
                stroke={DISTRICT_COLORS[index % DISTRICT_COLORS.length]}
                strokeWidth={2}
                dot={{ fill: DISTRICT_COLORS[index % DISTRICT_COLORS.length], strokeWidth: 0, r: 3 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ============================================
// Priority Trend Over Time
// ============================================
export function PriorityTrendChart({ records }: TimelineChartsProps) {
  const [showFilter, setShowFilter] = useState(false);
  const [viewMode, setViewMode] = useState<'stacked' | 'line'>('stacked');

  const priorityColors: Record<string, string> = {
    CRITICAL: '#dc2626',
    HIGH: '#f97316',
    MEDIUM: '#eab308',
    LOW: '#22c55e',
  };

  const chartData = useMemo(() => {
    const dailyMap = new Map<string, Record<string, number>>();
    
    records.forEach(r => {
      const key = getDateKey(r.createdAt);
      if (key && r.priority) {
        const current = dailyMap.get(key) || {};
        current[r.priority] = (current[r.priority] || 0) + 1;
        dailyMap.set(key, current);
      }
    });

    return Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, priorities]) => ({
        time: formatDate(date),
        ...priorities,
      }));
  }, [records]);

  const priorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 md:p-6">
      <div className="flex items-center justify-between mb-2 md:mb-4">
        <h3 className="text-xs md:text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
          <Clock size={16} className="text-red-500" />
          Priority Distribution Over Time
        </h3>
        <button 
          onClick={() => setShowFilter(!showFilter)}
          className={`p-1.5 md:p-2 rounded-lg border transition-colors ${showFilter ? 'bg-slate-100 border-slate-300' : 'border-slate-200 hover:bg-slate-50'}`}
        >
          <Filter size={14} className="md:w-4 md:h-4 text-slate-600" />
        </button>
      </div>

      {showFilter && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-600">Chart Type:</span>
            <button
              onClick={() => setViewMode('stacked')}
              className={`px-2 py-1 text-xs rounded ${viewMode === 'stacked' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'}`}
            >
              Stacked Area
            </button>
            <button
              onClick={() => setViewMode('line')}
              className={`px-2 py-1 text-xs rounded ${viewMode === 'line' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'}`}
            >
              Line Chart
            </button>
          </div>
        </div>
      )}

      <div className="h-[280px] md:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'stacked' ? (
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10 }} 
                angle={-45} 
                textAnchor="end" 
                height={60}
                stroke="#64748b"
              />
              <YAxis tick={{ fontSize: 10 }} stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              {priorities.map((priority) => (
                <Area
                  key={priority}
                  type="monotone"
                  dataKey={priority}
                  name={priority}
                  stroke={priorityColors[priority]}
                  fill={priorityColors[priority]}
                  fillOpacity={0.4}
                  stackId="1"
                />
              ))}
            </AreaChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10 }} 
                angle={-45} 
                textAnchor="end" 
                height={60}
                stroke="#64748b"
              />
              <YAxis tick={{ fontSize: 10 }} stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              {priorities.map((priority) => (
                <Line
                  key={priority}
                  type="monotone"
                  dataKey={priority}
                  name={priority}
                  stroke={priorityColors[priority]}
                  strokeWidth={2}
                  dot={{ fill: priorityColors[priority], strokeWidth: 0, r: 3 }}
                  connectNulls
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ============================================
// Response Time Analysis
// ============================================
export function ResponseTimeChart({ records }: TimelineChartsProps) {
  const chartData = useMemo(() => {
    const responseTimes: { district: string; avgHours: number; count: number }[] = [];
    
    // Group by district and calculate average response time
    const districtData = new Map<string, { totalHours: number; count: number }>();
    
    records.forEach(r => {
      if (r.district && r.createdAt && (r.rescuedAt || r.completedAt)) {
        const created = new Date(r.createdAt).getTime();
        const resolved = new Date(r.rescuedAt || r.completedAt || '').getTime();
        const hoursDiff = (resolved - created) / (1000 * 60 * 60);
        
        if (hoursDiff > 0 && hoursDiff < 720) { // Filter outliers (> 30 days)
          const current = districtData.get(r.district) || { totalHours: 0, count: 0 };
          current.totalHours += hoursDiff;
          current.count += 1;
          districtData.set(r.district, current);
        }
      }
    });

    districtData.forEach((data, district) => {
      responseTimes.push({
        district: district.length > 12 ? district.slice(0, 12) + '...' : district,
        avgHours: Math.round(data.totalHours / data.count * 10) / 10,
        count: data.count,
      });
    });

    return responseTimes
      .sort((a, b) => a.avgHours - b.avgHours)
      .slice(0, 15);
  }, [records]);

  const avgOverall = chartData.length > 0 
    ? Math.round(chartData.reduce((sum, d) => sum + d.avgHours, 0) / chartData.length * 10) / 10
    : 0;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 md:p-6">
      <div className="flex items-center justify-between mb-2 md:mb-4">
        <h3 className="text-xs md:text-sm font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
          <Clock size={16} className="text-cyan-500" />
          Average Response Time by District
        </h3>
      </div>

      <div className="h-[280px] md:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              type="number" 
              tick={{ fontSize: 10 }} 
              stroke="#64748b"
              label={{ value: 'Hours', position: 'bottom', fontSize: 10 }}
            />
            <YAxis 
              type="category" 
              dataKey="district" 
              tick={{ fontSize: 10 }} 
              width={80}
              stroke="#64748b"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: number, name: string) => [
                name === 'avgHours' ? `${value} hours` : value,
                name === 'avgHours' ? 'Avg Response Time' : 'Resolved Cases'
              ]}
            />
            <Bar 
              dataKey="avgHours" 
              name="Avg Hours" 
              fill="#06b6d4"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 text-xs text-slate-500 text-center">
        <span className="text-cyan-600 font-medium">Overall Average: {avgOverall} hours</span>
        <span className="mx-2">•</span>
        <span>Based on {chartData.reduce((sum, d) => sum + d.count, 0)} resolved cases</span>
      </div>
    </div>
  );
}
