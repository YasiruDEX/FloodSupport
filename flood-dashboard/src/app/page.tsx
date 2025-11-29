'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertTriangle, Download, Clock, ArrowLeft, BarChart3 } from 'lucide-react';
import { SOSRecord, DistrictSummary } from '@/types';
import { generateDistrictSummary, calculateTotals } from '@/lib/dataUtils';
import { StatsCards, DistrictTable, EmergencyTypeTable } from '@/components/Dashboard';
import {
  StatusByDistrictChart,
  PriorityByDistrictChart,
  EmergencyTypePieChart,
  PriorityPieChart,
  PeopleByDistrictChart,
  VulnerableGroupsChart,
} from '@/components/Charts';

interface FetchResponse {
  success: boolean;
  records: SOSRecord[];
  stats: {
    totalPeople: number;
    missingPeopleCount: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
  };
  totalRecords: number;
  fetchedAt: string;
  error?: string;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<SOSRecord[]>([]);
  const [districtSummary, setDistrictSummary] = useState<DistrictSummary[]>([]);
  const [totals, setTotals] = useState<DistrictSummary | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [apiStats, setApiStats] = useState<FetchResponse['stats'] | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sos');
      const data: FetchResponse = await response.json();

      if (data.success) {
        setRecords(data.records);
        const summary = generateDistrictSummary(data.records);
        setDistrictSummary(summary);
        setTotals(calculateTotals(summary));
        setLastUpdated(new Date(data.fetchedAt).toLocaleString());
        setApiStats(data.stats);
      } else {
        setError(data.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const exportCSV = () => {
    if (districtSummary.length === 0) return;

    const headers = [
      'District',
      'Total Cases',
      'Total People',
      'Pending',
      'Verified',
      'Rescued',
      'Cannot Contact',
      'Missing',
      'Critical',
      'High',
      'Medium',
      'Low',
      'Trapped',
      'Food/Water',
      'Medical',
      'Rescue',
      'Missing Person',
      'Other',
    ];

    const rows = districtSummary.map((d) => [
      d.district,
      d.total,
      d.totalPeople,
      d.pending,
      d.verified,
      d.rescued,
      d.cannotContact,
      d.missing,
      d.critical,
      d.high,
      d.medium,
      d.low,
      d.trapped,
      d.foodWater,
      d.medical,
      d.rescueAssistance,
      d.missingPerson,
      d.other,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flood-support-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <a
                href="https://floodsupport.org/sos/dashboard"
                className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 hover:border-slate-400 transition-colors"
              >
                <ArrowLeft size={20} />
              </a>
              <div>
                <h1 className="text-xl font-semibold flex items-center gap-2 text-slate-800">
                  <BarChart3 size={24} className="text-slate-600" />
                  District Analytics Dashboard
                </h1>
                <p className="text-slate-500 text-sm mt-0.5">
                  Real-time SOS data visualization for Sri Lanka flood relief
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {lastUpdated && (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Clock size={14} />
                  <span>Updated: {lastUpdated}</span>
                </div>
              )}
              <button
                onClick={exportCSV}
                disabled={loading || districtSummary.length === 0}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
              >
                <Download size={16} />
                Export CSV
              </button>
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 p-4 bg-white border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertTriangle size={18} />
            <span>Error: {error}</span>
            <button onClick={fetchData} className="ml-auto text-sm underline hover:no-underline">
              Retry
            </button>
          </div>
        )}

        {loading && records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw size={40} className="animate-spin text-slate-400 mb-4" />
            <p className="text-slate-600">Loading data from API...</p>
            <p className="text-slate-400 text-sm mt-2">
              This may take a moment as we fetch all records
            </p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            {totals && (
              <div className="mb-8">
                <StatsCards
                  totalCases={totals.total}
                  totalPeople={totals.totalPeople}
                  critical={totals.critical}
                  pending={totals.pending}
                  rescued={totals.rescued}
                  missing={totals.missing}
                  cannotContact={totals.cannotContact}
                  verified={totals.verified}
                />
              </div>
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <StatusByDistrictChart data={districtSummary} />
              <PriorityByDistrictChart data={districtSummary} />
              <EmergencyTypePieChart data={districtSummary} />
              <PriorityPieChart data={districtSummary} />
              <PeopleByDistrictChart data={districtSummary} />
              <VulnerableGroupsChart data={districtSummary} />
            </div>

            {/* Tables */}
            <div className="space-y-8">
              <DistrictTable data={districtSummary} />
              <EmergencyTypeTable data={districtSummary} />
            </div>

            {/* Footer Stats */}
            {apiStats && (
              <div className="mt-8 p-6 bg-white rounded-lg border border-slate-200">
                <h3 className="text-sm font-semibold mb-4 text-slate-700 uppercase tracking-wide">
                  Summary Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                  <div>
                    <span className="text-slate-500">Total People Affected</span>
                    <p className="text-2xl font-semibold text-slate-800 mt-1">
                      {apiStats.totalPeople.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Missing People</span>
                    <p className="text-2xl font-semibold text-slate-800 mt-1">
                      {apiStats.missingPeopleCount}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Total Records</span>
                    <p className="text-2xl font-semibold text-slate-800 mt-1">{records.length}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Districts Covered</span>
                    <p className="text-2xl font-semibold text-slate-800 mt-1">{districtSummary.length}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            Flood Support Dashboard — Data sourced from floodsupport.org API
          </p>
        </div>
      </footer>
    </main>
  );
}
