'use client';


import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertTriangle, Download, Clock, ArrowLeft, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';

import { SOSRecord, DistrictSummary } from '@/types';
import { generateDistrictSummary, calculateTotals } from '@/lib/dataUtils';
import { StatsCards, DistrictTable, EmergencyTypeTable } from '@/components/Dashboard';
import { GlobalFilters } from '@/components/GlobalFilters';
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

interface Filters {
  district: string;
  status: string;
  priority: string;
  emergencyType: string;
  hasChildren: string;
  hasElderly: string;
  hasMedicalEmergency: string;
  searchQuery: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-800 border-red-300',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  LOW: 'bg-green-100 text-green-800 border-green-300',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-800 border-gray-300',
  VERIFIED: 'bg-blue-100 text-blue-800 border-blue-300',
  ACKNOWLEDGED: 'bg-purple-100 text-purple-800 border-purple-300',
  IN_PROGRESS: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  RESCUED: 'bg-green-100 text-green-800 border-green-300',
  COMPLETED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  CANNOT_CONTACT: 'bg-red-100 text-red-800 border-red-300',
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<SOSRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<SOSRecord[]>([]);
  const [districtSummary, setDistrictSummary] = useState<DistrictSummary[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [apiStats, setApiStats] = useState<FetchResponse['stats'] | null>(null);

  const [showCharts, setShowCharts] = useState(true);

  // Handler for filtered records from GlobalFilters
  const handleFilteredRecords = useCallback((filtered: SOSRecord[]) => {
    setFilteredRecords(filtered);
    const summary = generateDistrictSummary(filtered);
    setDistrictSummary(summary);
    setTotals(calculateTotals(summary));
  }, []);


  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sos');
      const data: FetchResponse = await response.json();

      if (data.success) {
        setRecords(data.records);
        // Initial summary will be set by GlobalFilters component
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
  
  // Extract unique values for filter dropdowns
  const filterOptions = useMemo(() => {
    const districts = [...new Set(records.map(r => r.district).filter(Boolean))].sort();
    const statuses = [...new Set(records.map(r => r.status).filter(Boolean))];
    const priorities = [...new Set(records.map(r => r.priority).filter(Boolean))];
    const emergencyTypes = [...new Set(records.map(r => r.emergencyType).filter(Boolean))];
    return { districts, statuses, priorities, emergencyTypes };
  }, [records]);
  
  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      if (filters.district !== 'all' && record.district !== filters.district) return false;
      if (filters.status !== 'all' && record.status !== filters.status) return false;
      if (filters.priority !== 'all' && record.priority !== filters.priority) return false;
      if (filters.emergencyType !== 'all' && record.emergencyType !== filters.emergencyType) return false;
      if (filters.hasChildren === 'yes' && !record.hasChildren) return false;
      if (filters.hasChildren === 'no' && record.hasChildren) return false;
      if (filters.hasElderly === 'yes' && !record.hasElderly) return false;
      if (filters.hasElderly === 'no' && record.hasElderly) return false;
      if (filters.hasMedicalEmergency === 'yes' && !record.hasMedicalEmergency) return false;
      if (filters.hasMedicalEmergency === 'no' && record.hasMedicalEmergency) return false;
      
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          record.fullName?.toLowerCase().includes(query) ||
          record.referenceNumber?.toLowerCase().includes(query) ||
          record.phoneNumber?.includes(query) ||
          record.address?.toLowerCase().includes(query) ||
          record.district?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [records, filters]);
  
  // Sorted records
  const sortedRecords = useMemo(() => {
    if (!sortConfig) return filteredRecords;
    
    return [...filteredRecords].sort((a, b) => {
      const aVal = a[sortConfig.key as keyof SOSRecord];
      const bVal = b[sortConfig.key as keyof SOSRecord];
      
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortConfig.direction === 'asc' 
        ? aStr.localeCompare(bStr) 
        : bStr.localeCompare(aStr);
    });
  }, [filteredRecords, sortConfig]);
  
  // Filtered summary based on filtered records
  const filteredSummary = useMemo(() => {
    return generateDistrictSummary(filteredRecords);
  }, [filteredRecords]);
  
  const filteredTotals = useMemo(() => {
    return calculateTotals(filteredSummary);
  }, [filteredSummary]);
  
  const hasActiveFilters = filters.district !== 'all' || 
    filters.status !== 'all' || 
    filters.priority !== 'all' || 
    filters.emergencyType !== 'all' ||
    filters.hasChildren !== 'all' ||
    filters.hasElderly !== 'all' ||
    filters.hasMedicalEmergency !== 'all' ||
    filters.searchQuery !== '';
  
  const clearFilters = () => {
    setFilters({
      district: 'all',
      status: 'all',
      priority: 'all',
      emergencyType: 'all',
      hasChildren: 'all',
      hasElderly: 'all',
      hasMedicalEmergency: 'all',
      searchQuery: '',
    });
  };
  
  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'desc' };
    });
  };

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

  // Check if filters are active (filtered count differs from total)
  const filtersActive = filteredRecords.length !== records.length && records.length > 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <a
                href="https://floodsupport.org/sos/dashboard"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
              >
                <ArrowLeft size={20} />
              </a>
              <div>
                <h1 className="text-xl font-semibold flex items-center gap-2 text-white">
                  <BarChart3 size={24} className="text-cyan-300" />
                  District Analytics Dashboard
                </h1>
                <p className="text-blue-100 text-sm mt-0.5">
                  Real-time SOS data visualization for Sri Lanka flood relief
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {lastUpdated && (
                <div className="flex items-center gap-2 text-blue-100 text-sm">
                  <Clock size={14} />
                  <span>Updated: {lastUpdated}</span>
                </div>
              )}
              <button
                onClick={exportCSV}
                disabled={loading || districtSummary.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors backdrop-blur-sm"
              >
                <Download size={16} />
                Export CSV
              </button>
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors shadow-md"
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
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertTriangle size={18} />
            <span>Error: {error}</span>
            <button onClick={fetchData} className="ml-auto text-sm underline hover:no-underline">
              Retry
            </button>
          </div>
        )}

        {loading && records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw size={40} className="animate-spin text-indigo-500 mb-4" />
            <p className="text-slate-600">Loading data from API...</p>
            <p className="text-slate-400 text-sm mt-2">
              This may take a moment as we fetch all records
            </p>
          </div>
        ) : (
          <>
            {/* Global Filters */}
            {records.length > 0 && (
              <GlobalFilters
                records={records}
                onFilteredRecords={handleFilteredRecords}
              />
            )}

            {/* Filter Status Banner */}
            {filtersActive && (
              <div className="mb-6 p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center gap-2 text-indigo-700 text-sm">
                <span className="font-medium">Filters applied:</span>
                <span>Showing {filteredRecords.length.toLocaleString()} of {records.length.toLocaleString()} records</span>
              </div>
            )}

            {/* Stats Cards */}
            {totals && (
              <div className="mb-8">
                <StatsCards
                  totalCases={filteredTotals.total}
                  totalPeople={filteredTotals.totalPeople}
                  critical={filteredTotals.critical}
                  pending={filteredTotals.pending}
                  rescued={filteredTotals.rescued}
                  missing={filteredTotals.missing}
                  cannotContact={filteredTotals.cannotContact}
                  verified={filteredTotals.verified}
                />
              </div>
            )}

            {/* Charts Section */}
            <div className="mb-8">
              <button
                onClick={() => setShowCharts(!showCharts)}
                className="flex items-center gap-2 mb-4 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <BarChart3 size={18} />
                {showCharts ? 'Hide Charts' : 'Show Charts'}
                {showCharts ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              
              {showCharts && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <StatusByDistrictChart data={districtSummary} />
                  <PriorityByDistrictChart data={districtSummary} />
                  <EmergencyTypePieChart data={districtSummary} />
                  <PriorityPieChart data={districtSummary} />
                  <PeopleByDistrictChart data={districtSummary} />
                  <VulnerableGroupsChart data={districtSummary} />
                </div>
              )}
            </div>

                {/* Tables */}
                <div className="space-y-8">
                  <DistrictTable data={filteredSummary} />
                  <EmergencyTypeTable data={filteredSummary} />
                </div>
              </>
            ) : (
              /* Records View */
              <RecordsTable />
            )}

            {/* Footer Stats */}
            {apiStats && (
              <div className="mt-8 p-6 bg-gradient-to-r from-white via-blue-50 to-indigo-50 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-semibold mb-4 text-indigo-700 uppercase tracking-wide">
                  Summary Statistics {hasActiveFilters && '(Filtered)'}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                  <div className="p-4 bg-white rounded-lg shadow-sm border border-blue-100">
                    <span className="text-blue-600 font-medium">Total People Affected</span>
                    <p className="text-3xl font-bold text-blue-700 mt-1">
                      {filteredTotals?.totalPeople.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-lg shadow-sm border border-orange-100">
                    <span className="text-orange-600 font-medium">Missing People</span>
                    <p className="text-3xl font-bold text-orange-700 mt-1">
                      {filteredTotals?.missing || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-lg shadow-sm border border-purple-100">
                    <span className="text-purple-600 font-medium">Filtered Records</span>
                    <p className="text-3xl font-bold text-purple-700 mt-1">{filteredRecords.length}</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg shadow-sm border border-emerald-100">
                    <span className="text-emerald-600 font-medium">Districts Covered</span>
                    <p className="text-3xl font-bold text-emerald-700 mt-1">{filteredSummary.length}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-4 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-blue-100 text-sm">
            Flood Support Dashboard — Data sourced from floodsupport.org API
          </p>
        </div>
      </footer>
      
      {/* Record Detail Modal */}
      <RecordDetailModal />
    </main>
  );
}
