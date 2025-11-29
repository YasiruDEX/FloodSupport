'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertTriangle, Download, Clock, Waves } from 'lucide-react';
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
    <main className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Waves size={36} />
                Flood Support Dashboard
              </h1>
              <p className="text-blue-100 mt-1">
                Real-time SOS data visualization for Sri Lanka flood relief
              </p>
            </div>
            <div className="flex items-center gap-3">
              {lastUpdated && (
                <div className="flex items-center gap-2 text-blue-100 text-sm">
                  <Clock size={16} />
                  <span>Last updated: {lastUpdated}</span>
                </div>
              )}
              <button
                onClick={exportCSV}
                disabled={loading || districtSummary.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 rounded-lg font-medium transition-colors"
              >
                <Download size={18} />
                Export CSV
              </button>
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 disabled:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                {loading ? 'Loading...' : 'Refresh Data'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg flex items-center gap-3 text-red-800">
            <AlertTriangle />
            <span>Error: {error}</span>
            <button onClick={fetchData} className="ml-auto underline">
              Retry
            </button>
          </div>
        )}

        {loading && records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw size={48} className="animate-spin text-blue-500 mb-4" />
            <p className="text-gray-600">Loading data from API...</p>
            <p className="text-gray-400 text-sm mt-2">
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
              <div className="mt-8 p-6 bg-white rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  API Statistics Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Total People Affected:</span>
                    <span className="ml-2 font-bold text-blue-600">
                      {apiStats.totalPeople.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Missing People:</span>
                    <span className="ml-2 font-bold text-orange-600">
                      {apiStats.missingPeopleCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Records Loaded:</span>
                    <span className="ml-2 font-bold text-green-600">{records.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Districts:</span>
                    <span className="ml-2 font-bold text-purple-600">{districtSummary.length}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-700 text-gray-300 py-6 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p>Flood Support Dashboard - Data from floodsupport.org API</p>
          <p className="text-sm mt-1">
            Built to help coordinate flood relief efforts in Sri Lanka
          </p>
        </div>
      </footer>
    </main>
  );
}
