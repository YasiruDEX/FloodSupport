'use client';

import { useState, useMemo } from 'react';
import { Filter, X, ChevronUp, ChevronDown, Search } from 'lucide-react';
import { SOSRecord } from '@/types';

export interface FilterState {
  district: string;
  status: string;
  priority: string;
  emergencyType: string;
  hasChildren: string;
  hasElderly: string;
  hasMedicalEmergency: string;
  searchQuery: string;
}

const initialFilters: FilterState = {
  district: 'all',
  status: 'all',
  priority: 'all',
  emergencyType: 'all',
  hasChildren: 'any',
  hasElderly: 'any',
  hasMedicalEmergency: 'any',
  searchQuery: '',
};

interface GlobalFiltersProps {
  records: SOSRecord[];
  onFilteredRecords: (filtered: SOSRecord[]) => void;
}

export function GlobalFilters({ records, onFilteredRecords }: GlobalFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract unique values for dropdowns
  const districts = useMemo(() => {
    const unique = Array.from(new Set(records.map(r => r.district).filter(Boolean))).sort();
    return unique;
  }, [records]);

  const statuses = useMemo(() => {
    const unique = Array.from(new Set(records.map(r => r.status).filter(Boolean))).sort();
    return unique;
  }, [records]);

  const priorities = useMemo(() => {
    const unique = Array.from(new Set(records.map(r => r.priority).filter(Boolean))).sort();
    return unique;
  }, [records]);

  const emergencyTypes = useMemo(() => {
    const unique = Array.from(new Set(records.map(r => r.emergencyType).filter(Boolean))).sort();
    return unique;
  }, [records]);

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      // District filter
      if (filters.district !== 'all' && record.district !== filters.district) return false;
      
      // Status filter
      if (filters.status !== 'all' && record.status !== filters.status) return false;
      
      // Priority filter
      if (filters.priority !== 'all' && record.priority !== filters.priority) return false;
      
      // Emergency type filter
      if (filters.emergencyType !== 'all' && record.emergencyType !== filters.emergencyType) return false;
      
      // Has Children filter
      if (filters.hasChildren === 'yes' && !record.hasChildren) return false;
      if (filters.hasChildren === 'no' && record.hasChildren) return false;
      
      // Has Elderly filter
      if (filters.hasElderly === 'yes' && !record.hasElderly) return false;
      if (filters.hasElderly === 'no' && record.hasElderly) return false;
      
      // Medical Emergency filter
      if (filters.hasMedicalEmergency === 'yes' && !record.hasMedicalEmergency) return false;
      if (filters.hasMedicalEmergency === 'no' && record.hasMedicalEmergency) return false;
      
      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchFields = [
          record.fullName,
          record.referenceNumber,
          record.phoneNumber,
          record.address,
          record.district,
        ].filter(Boolean).map(f => f.toLowerCase());
        
        if (!searchFields.some(field => field.includes(query))) return false;
      }
      
      return true;
    });
  }, [records, filters]);

  // Update parent with filtered records
  useMemo(() => {
    onFilteredRecords(filteredRecords);
  }, [filteredRecords, onFilteredRecords]);

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters(initialFilters);
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'searchQuery') return value !== '';
    if (['hasChildren', 'hasElderly', 'hasMedicalEmergency'].includes(key)) return value !== 'any';
    return value !== 'all';
  });

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'searchQuery') return value !== '';
    if (['hasChildren', 'hasElderly', 'hasMedicalEmergency'].includes(key)) return value !== 'any';
    return value !== 'all';
  }).length;

  return (
    <div className="bg-white rounded-lg border border-slate-200 mb-6 overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Filter size={18} className="text-indigo-600" />
          <span className="font-medium text-slate-700">Filters (Expand to use)</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs font-medium rounded-full">
              {activeFilterCount} Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearAllFilters();
              }}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Clear All
            </button>
          )}
          {isExpanded ? (
            <ChevronUp size={18} className="text-slate-500" />
          ) : (
            <ChevronDown size={18} className="text-slate-500" />
          )}
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-4">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, reference, phone, address..."
                value={filters.searchQuery}
                onChange={(e) => updateFilter('searchQuery', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {filters.searchQuery && (
                <button
                  onClick={() => updateFilter('searchQuery', '')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {/* District */}
            <div>
              <label className="block text-xs font-medium text-indigo-600 mb-1.5">District</label>
              <select
                value={filters.district}
                onChange={(e) => updateFilter('district', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Districts</option>
                {districts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-orange-600 mb-1.5">Status</label>
              <select
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                {statuses.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-medium text-purple-600 mb-1.5">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => updateFilter('priority', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                {priorities.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Emergency Type */}
            <div>
              <label className="block text-xs font-medium text-cyan-600 mb-1.5">Emergency Type</label>
              <select
                value={filters.emergencyType}
                onChange={(e) => updateFilter('emergencyType', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                {emergencyTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Has Children */}
            <div>
              <label className="block text-xs font-medium text-red-600 mb-1.5">Has Children</label>
              <select
                value={filters.hasChildren}
                onChange={(e) => updateFilter('hasChildren', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="any">Any</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            {/* Has Elderly */}
            <div>
              <label className="block text-xs font-medium text-green-600 mb-1.5">Has Elderly</label>
              <select
                value={filters.hasElderly}
                onChange={(e) => updateFilter('hasElderly', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="any">Any</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            {/* Medical Emergency */}
            <div>
              <label className="block text-xs font-medium text-rose-600 mb-1.5">Medical Emergency</label>
              <select
                value={filters.hasMedicalEmergency}
                onChange={(e) => updateFilter('hasMedicalEmergency', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="any">Any</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <p className="text-sm text-slate-600">
              Showing <span className="font-semibold text-slate-800">{filteredRecords.length.toLocaleString()}</span> of{' '}
              <span className="font-semibold text-slate-800">{records.length.toLocaleString()}</span> records
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
