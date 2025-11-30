'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw, AlertTriangle, Download, Clock, ArrowLeft, BarChart3, Filter, X, Search, ChevronDown, ChevronUp, Eye, MapPin, Phone, Users, TrendingUp } from 'lucide-react';
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
  DistrictImpactBubbleChart,
} from '@/components/Charts';
import {
  SOSOverTimeChart,
  RescuesOverTimeChart,
  StatusTimelineChart,
  DistrictActivityChart,
  PriorityTrendChart,
  ResponseTimeChart,
} from '@/components/TimelineCharts';

interface ChunkResponse {
  success: boolean;
  records: SOSRecord[];
  stats: {
    totalPeople: number;
    missingPeopleCount: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  fetchedAt: string;
  error?: string;
}

interface FetchProgress {
  currentPage: number;
  totalPages: number;
  recordsFetched: number;
  totalRecords: number;
  isComplete: boolean;
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
  const [districtSummary, setDistrictSummary] = useState<DistrictSummary[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [apiStats, setApiStats] = useState<ChunkResponse['stats'] | null>(null);
  
  // Progressive loading state
  const [fetchProgress, setFetchProgress] = useState<FetchProgress | null>(null);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    district: 'all',
    status: 'all',
    priority: 'all',
    emergencyType: 'all',
    hasChildren: 'all',
    hasElderly: 'all',
    hasMedicalEmergency: 'all',
    searchQuery: '',
  });
  
  // View state
  const [activeView, setActiveView] = useState<'charts' | 'records' | 'timeline'>('charts');
  const [selectedRecord, setSelectedRecord] = useState<SOSRecord | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRecords([]);
    setFetchProgress(null);

    const CHUNK_SIZE = 200;
    let page = 1;
    let totalPages = 1;
    let totalRecords = 0;
    const allRecords: SOSRecord[] = [];

    try {
      // Fetch data in chunks
      while (page <= totalPages) {
        const response = await fetch(`/api/sos/chunk?page=${page}&limit=${CHUNK_SIZE}`);
        const data: ChunkResponse = await response.json();

        if (data.success) {
          // Add new records
          allRecords.push(...data.records);
          
          // Update state progressively
          setRecords([...allRecords]);
          const summary = generateDistrictSummary(allRecords);
          setDistrictSummary(summary);
          
          // Update pagination info
          totalPages = data.pagination.totalPages;
          totalRecords = data.pagination.totalCount;
          
          // Update progress
          setFetchProgress({
            currentPage: page,
            totalPages,
            recordsFetched: allRecords.length,
            totalRecords,
            isComplete: page >= totalPages,
          });

          // Set stats from first page
          if (page === 1) {
            setApiStats(data.stats);
          }
          
          setLastUpdated(new Date(data.fetchedAt).toLocaleString());
          page++;
        } else {
          throw new Error(data.error || 'Failed to fetch data');
        }
      }

      // Mark loading complete
      setFetchProgress(prev => prev ? { ...prev, isComplete: true } : null);
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
    const districts = Array.from(new Set(records.map(r => r.district).filter(Boolean))).sort();
    const statuses = Array.from(new Set(records.map(r => r.status).filter(Boolean)));
    const priorities = Array.from(new Set(records.map(r => r.priority).filter(Boolean)));
    const emergencyTypes = Array.from(new Set(records.map(r => r.emergencyType).filter(Boolean)));
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

  // Filter panel component
  const FilterPanel = () => (
    <div className={`bg-white rounded-xl border border-slate-200 mb-6 overflow-hidden transition-all shadow-sm ${showFilters ? '' : 'h-14'}`}>
      <button 
        onClick={() => setShowFilters(!showFilters)}
        className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 border-b border-slate-200 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-600" />
          <span className="font-medium text-slate-700">Filters</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-slate-800 text-white text-xs rounded-full font-medium">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && showFilters && (
            <button 
              onClick={(e) => { e.stopPropagation(); clearFilters(); }}
              className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              Clear All
            </button>
          )}
          {showFilters ? <ChevronUp size={18} className="text-slate-600" /> : <ChevronDown size={18} className="text-slate-600" />}
        </div>
      </button>
      
      {showFilters && (
        <div className="p-4">
          {/* Search bar */}
          <div className="mb-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, reference, phone, address..."
                value={filters.searchQuery}
                onChange={(e) => setFilters(f => ({ ...f, searchQuery: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 outline-none text-sm"
              />
              {filters.searchQuery && (
                <button 
                  onClick={() => setFilters(f => ({ ...f, searchQuery: '' }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
          
          {/* Filter dropdowns */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">District</label>
              <select
                value={filters.district}
                onChange={(e) => setFilters(f => ({ ...f, district: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-400 outline-none bg-white"
              >
                <option value="all">All Districts</option>
                {filterOptions.districts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-400 outline-none bg-white"
              >
                <option value="all">All Statuses</option>
                {filterOptions.statuses.map(s => (
                  <option key={s} value={s}>{s?.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(f => ({ ...f, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-400 outline-none bg-white"
              >
                <option value="all">All Priorities</option>
                {filterOptions.priorities.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Emergency Type</label>
              <select
                value={filters.emergencyType}
                onChange={(e) => setFilters(f => ({ ...f, emergencyType: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-400 outline-none bg-white"
              >
                <option value="all">All Types</option>
                {filterOptions.emergencyTypes.map(t => (
                  <option key={t} value={t}>{t?.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Has Children</label>
              <select
                value={filters.hasChildren}
                onChange={(e) => setFilters(f => ({ ...f, hasChildren: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-400 outline-none bg-white"
              >
                <option value="all">Any</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Has Elderly</label>
              <select
                value={filters.hasElderly}
                onChange={(e) => setFilters(f => ({ ...f, hasElderly: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-400 outline-none bg-white"
              >
                <option value="all">Any</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Medical Emergency</label>
              <select
                value={filters.hasMedicalEmergency}
                onChange={(e) => setFilters(f => ({ ...f, hasMedicalEmergency: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-400 outline-none bg-white"
              >
                <option value="all">Any</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
          
          {/* Filter summary */}
          {hasActiveFilters && (
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-sm text-slate-600">
                Showing <strong className="text-slate-800">{filteredRecords.length}</strong> of <strong>{records.length}</strong> records
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
  
  // Record detail modal
  const RecordDetailModal = () => {
    if (!selectedRecord) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedRecord(null)}>
        <div 
          className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">{selectedRecord.fullName || 'Unknown'}</h2>
              <p className="text-sm text-slate-500">Ref: {selectedRecord.referenceNumber}</p>
            </div>
            <button 
              onClick={() => setSelectedRecord(null)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Status badges */}
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${PRIORITY_COLORS[selectedRecord.priority || ''] || 'bg-slate-100 text-slate-800'}`}>
                {selectedRecord.priority}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${STATUS_COLORS[selectedRecord.status || ''] || 'bg-slate-100 text-slate-800'}`}>
                {selectedRecord.status?.replace(/_/g, ' ')}
              </span>
              {selectedRecord.emergencyType && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 border border-indigo-300">
                  {selectedRecord.emergencyType.replace(/_/g, ' ')}
                </span>
              )}
            </div>
            
            {/* Contact info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 uppercase">Phone</p>
                  <p className="text-sm font-medium">{selectedRecord.phoneNumber || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-500 uppercase">District</p>
                  <p className="text-sm font-medium">{selectedRecord.district || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            {/* Address */}
            {selectedRecord.address && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase mb-1">Address</p>
                <p className="text-sm">{selectedRecord.address}</p>
              </div>
            )}
            
            {/* People details */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                <h3 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Users size={16} />
                  People Information
                </h3>
              </div>
              <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Total People</p>
                  <p className="font-semibold">{selectedRecord.numberOfPeople || 0}</p>
                </div>
                <div>
                  <p className="text-slate-500">Children</p>
                  <p className="font-semibold">{selectedRecord.hasChildren ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Elderly</p>
                  <p className="font-semibold">{selectedRecord.hasElderly ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Medical Emergency</p>
                  <p className="font-semibold">{selectedRecord.hasMedicalEmergency ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
            
            {/* Description */}
            {selectedRecord.description && (
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">Description</h3>
                <p className="text-sm text-slate-600 p-3 bg-slate-50 rounded-lg">
                  {selectedRecord.description}
                </p>
              </div>
            )}
            
            {/* Timestamps */}
            <div className="text-xs text-slate-400 flex gap-4">
              {selectedRecord.createdAt && (
                <span>Created: {new Date(selectedRecord.createdAt).toLocaleString()}</span>
              )}
              {selectedRecord.updatedAt && (
                <span>Updated: {new Date(selectedRecord.updatedAt).toLocaleString()}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Records table view
  const RecordsTable = () => {
    const SortHeader = ({ label, sortKey }: { label: string; sortKey: string }) => (
      <th 
        className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
        onClick={() => handleSort(sortKey)}
      >
        <div className="flex items-center gap-1">
          {label}
          {sortConfig?.key === sortKey && (
            sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
          )}
        </div>
      </th>
    );
    
    return (
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <SortHeader label="Reference" sortKey="referenceNumber" />
                <SortHeader label="Name" sortKey="fullName" />
                <SortHeader label="District" sortKey="district" />
                <SortHeader label="Status" sortKey="status" />
                <SortHeader label="Priority" sortKey="priority" />
                <SortHeader label="Type" sortKey="emergencyType" />
                <SortHeader label="People" sortKey="numberOfPeople" />
                <th className="px-3 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedRecords.slice(0, 100).map((record, idx) => (
                <tr key={record.id || idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-3 text-sm font-mono text-slate-600">
                    {record.referenceNumber?.slice(0, 10)}...
                  </td>
                  <td className="px-3 py-3 text-sm font-medium text-slate-800">
                    {record.fullName || 'N/A'}
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-600">
                    {record.district}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${STATUS_COLORS[record.status || ''] || 'bg-slate-100'}`}>
                      {record.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${PRIORITY_COLORS[record.priority || ''] || 'bg-slate-100'}`}>
                      {record.priority}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-600">
                    {record.emergencyType?.replace(/_/g, ' ')}
                  </td>
                  <td className="px-3 py-3 text-sm text-center text-slate-600">
                    {record.numberOfPeople || 0}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button
                      onClick={() => setSelectedRecord(record)}
                      className="p-1.5 hover:bg-slate-200 rounded transition-colors"
                      title="View details"
                    >
                      <Eye size={16} className="text-slate-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sortedRecords.length > 100 && (
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-sm text-slate-600 text-center">
            Showing first 100 of {sortedRecords.length} records. Use filters to narrow results.
          </div>
        )}
        {sortedRecords.length === 0 && (
          <div className="px-4 py-10 text-center text-slate-500">
            No records match your filters.
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <a
                href="https://floodsupport.org/sos/dashboard"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors border border-slate-200"
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
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
              >
                <Download size={16} />
                Export CSV
              </button>
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors border border-slate-300"
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
            <RefreshCw size={40} className="animate-spin text-slate-500 mb-4" />
            <p className="text-slate-600">Loading data from API...</p>
            {fetchProgress && (
              <div className="mt-4 w-full max-w-md">
                <div className="flex justify-between text-sm text-slate-500 mb-2">
                  <span>Fetching records...</span>
                  <span>{fetchProgress.recordsFetched || 0} / {fetchProgress.totalRecords || '...'}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${fetchProgress.totalRecords ? (fetchProgress.recordsFetched / fetchProgress.totalRecords) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2 text-center">
                  Page {fetchProgress.currentPage || 1} of {fetchProgress.totalPages || '?'}
                </p>
              </div>
            )}
            {!fetchProgress && (
              <p className="text-slate-400 text-sm mt-2">
                Initializing connection...
              </p>
            )}
          </div>
        ) : (
          <>
            {/* View Toggle */}
            <div className="mb-6 flex items-center gap-2">
              <div className="bg-white p-1 rounded-lg border border-slate-200 inline-flex flex-wrap shadow-sm">
                <button
                  onClick={() => setActiveView('charts')}
                  className={`px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === 'charts' 
                      ? 'bg-slate-800 text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-1.5 md:gap-2">
                    <BarChart3 size={16} />
                    <span className="hidden sm:inline">Charts</span>
                  </span>
                </button>
                <button
                  onClick={() => setActiveView('timeline')}
                  className={`px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === 'timeline' 
                      ? 'bg-slate-800 text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-1.5 md:gap-2">
                    <TrendingUp size={16} />
                    <span className="hidden sm:inline">Time Analysis</span>
                  </span>
                </button>
                <button
                  onClick={() => setActiveView('records')}
                  className={`px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === 'records' 
                      ? 'bg-slate-800 text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-1.5 md:gap-2">
                    <Users size={16} />
                    <span className="hidden sm:inline">Records</span>
                    <span className="text-xs opacity-75">({filteredRecords.length})</span>
                  </span>
                </button>
              </div>
            </div>
            
            {/* Filter Panel */}
            <FilterPanel />
            
            {/* Stats Cards - always show filtered stats */}
            {filteredTotals && (
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

            {activeView === 'charts' ? (
              <>
                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <StatusByDistrictChart data={filteredSummary} />
                  <PriorityByDistrictChart data={filteredSummary} />
                  <EmergencyTypePieChart data={filteredSummary} />
                  <PriorityPieChart data={filteredSummary} />
                  <PeopleByDistrictChart data={filteredSummary} />
                  <VulnerableGroupsChart data={filteredSummary} />
                </div>

                {/* Bubble Chart - Above Tables */}
                <div className="mb-8">
                  <DistrictImpactBubbleChart records={filteredRecords} />
                </div>

                {/* Tables */}
                <div className="space-y-8">
                  <DistrictTable data={filteredSummary} />
                  <EmergencyTypeTable data={filteredSummary} />
                </div>
              </>
            ) : activeView === 'timeline' ? (
              <>
                {/* Time Analysis Section Header */}
                {/* <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-violet-50 rounded-xl border border-blue-100">
                  <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <TrendingUp size={20} className="text-blue-600" />
                    Time-Based Analysis
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Track SOS submissions, rescue operations, and district activity over time. Use filters on each chart to customize your view.
                  </p>
                </div> */}

                {/* Time Series Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <SOSOverTimeChart records={filteredRecords} />
                  <RescuesOverTimeChart records={filteredRecords} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <StatusTimelineChart records={filteredRecords} />
                  <PriorityTrendChart records={filteredRecords} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <DistrictActivityChart records={filteredRecords} />
                  <ResponseTimeChart records={filteredRecords} />
                </div>
              </>
            ) : (
              /* Records View */
              <RecordsTable />
            )}

            {/* Footer Stats */}
            {apiStats && (
              <div className="mt-8 p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-semibold mb-4 text-slate-700 uppercase tracking-wide">
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
      <footer className="bg-white border-t border-slate-200 py-4 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            Flood Support Stats — Data sourced from floodsupport.org API, developed by{' '}
            <a 
              href="https://www.linkedin.com/in/prabath-wijethilaka-4950b220b/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-700 hover:text-slate-900 underline underline-offset-2"
            >
              Prabath Wijethilaka
            </a>
            {' '}and{' '}
            <a 
              href="https://www.linkedin.com/in/yasirubasnayake/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-700 hover:text-slate-900 underline underline-offset-2"
            >
              Yasiru Basnayake
            </a>
          </p>
        </div>
      </footer>
      
      {/* Record Detail Modal */}
      <RecordDetailModal />

      {/* Fixed Loading Indicator - Shows when data is still being fetched */}
      {loading && records.length > 0 && fetchProgress && !fetchProgress.isComplete && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md md:max-w-lg">
          <div className="bg-white/95 backdrop-blur-sm border border-blue-200 rounded-xl shadow-lg p-3 md:p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] md:text-xs font-bold text-blue-600">
                  {fetchProgress.totalRecords ? Math.round((fetchProgress.recordsFetched / fetchProgress.totalRecords) * 100) : 0}%
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs md:text-sm font-semibold text-slate-700 truncate">
                    Loading Data...
                  </span>
                  <span className="text-[10px] md:text-xs text-slate-500 ml-2 shrink-0">
                    {(fetchProgress.recordsFetched || 0).toLocaleString()} / {(fetchProgress.totalRecords || 0).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 md:h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${fetchProgress.totalRecords ? (fetchProgress.recordsFetched / fetchProgress.totalRecords) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-[10px] md:text-xs text-slate-400 mt-1">
                  Visualizations update as data loads • Page {fetchProgress.currentPage || 1}/{fetchProgress.totalPages || '?'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
