import React, { useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  Circle,
  Filter,
  Check,
  MapPin,
  ChevronRight,
  X,
} from 'lucide-react';
import { DistrictInfo, StatusFilter, DivisionName } from '../types';
import { DISTRICTS, DIVISIONS } from '../data/districts';

interface DistrictSidebarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (filter: StatusFilter) => void;
  selectedDivision: DivisionName;
  setSelectedDivision: (div: DivisionName) => void;
  selectedDistrictId: string | null;
  onSelectDistrict: (id: string) => void;
  isVisited: (id: string) => boolean;
  onToggleVisited: (id: string) => void;
  hoveredDistrictId: string | null;
  setHoveredDistrictId: (id: string | null) => void;
}

export const DistrictSidebar: React.FC<DistrictSidebarProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  selectedDivision,
  setSelectedDivision,
  selectedDistrictId,
  onSelectDistrict,
  isVisited,
  onToggleVisited,
  hoveredDistrictId,
  setHoveredDistrictId,
}) => {
  // Filtered districts
  const filteredDistricts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return DISTRICTS.filter((d) => {
      // Search match
      const matchesSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.nameBn.includes(q) ||
        d.division.toLowerCase().includes(q) ||
        d.spots.some((s) => s.toLowerCase().includes(q));

      // Division match
      const matchesDivision =
        selectedDivision === 'All' || d.division === selectedDivision;

      // Status match
      const visited = isVisited(d.id);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'visited' && visited) ||
        (statusFilter === 'unvisited' && !visited);

      return matchesSearch && matchesDivision && matchesStatus;
    });
  }, [searchQuery, selectedDivision, statusFilter, isVisited]);

  const visitedCount = useMemo(
    () => DISTRICTS.filter((d) => isVisited(d.id)).length,
    [isVisited]
  );
  const unvisitedCount = 64 - visitedCount;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header & Search */}
      <div className="p-4 border-b border-slate-200 space-y-3 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Districts Directory ({filteredDistricts.length})
            </h2>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-500 hover:text-slate-700 flex items-center space-x-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear search</span>
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search district, spot, or বাংলা নাম..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400 transition"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-200/60 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`py-1.5 rounded-lg transition ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All (64)
          </button>
          <button
            onClick={() => setStatusFilter('visited')}
            className={`py-1.5 rounded-lg transition ${
              statusFilter === 'visited'
                ? 'bg-emerald-600 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Visited ({visitedCount})
          </button>
          <button
            onClick={() => setStatusFilter('unvisited')}
            className={`py-1.5 rounded-lg transition ${
              statusFilter === 'unvisited'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Unvisited ({unvisitedCount})
          </button>
        </div>

        {/* Division Filter Dropdown */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500 font-medium shrink-0">Division:</span>
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value as DivisionName)}
            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Divisions (বিভাগ)</option>
            {DIVISIONS.map((d) => (
              <option key={d.en} value={d.en}>
                {d.en} ({d.bn}) — {d.districtsCount} Districts
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* District Cards List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1.5">
        {filteredDistricts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700 mb-1">No districts found</p>
            <p className="text-xs text-slate-500">
              Try adjusting your search query or filter settings.
            </p>
          </div>
        ) : (
          filteredDistricts.map((district) => {
            const visited = isVisited(district.id);
            const isSelected = selectedDistrictId === district.id;
            const isHovered = hoveredDistrictId === district.id;

            return (
              <div
                key={district.id}
                onMouseEnter={() => setHoveredDistrictId(district.id)}
                onMouseLeave={() => setHoveredDistrictId(null)}
                onClick={() => onSelectDistrict(district.id)}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition border text-left ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : isHovered
                    ? 'bg-slate-50 border-slate-300'
                    : visited
                    ? 'bg-emerald-50/40 border-emerald-100 hover:border-emerald-300'
                    : 'bg-white border-slate-200/70 hover:border-slate-300'
                }`}
              >
                {/* District Names & Info */}
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-sm font-bold truncate ${
                        isSelected ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {district.name}
                    </span>
                    <span
                      className={`text-xs font-bangla ${
                        isSelected ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {district.nameBn}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 mt-1">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        isSelected
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {district.division}
                    </span>

                    <span
                      className={`text-[10px] truncate max-w-[130px] ${
                        isSelected ? 'text-slate-300' : 'text-slate-400'
                      }`}
                      title={district.spots.join(', ')}
                    >
                      {district.spots[0]}
                    </span>
                  </div>
                </div>

                {/* Status Indicator & Quick Toggle */}
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisited(district.id);
                    }}
                    className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
                      visited
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                        : isSelected
                        ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200'
                    }`}
                    title={visited ? 'Click to mark unvisited' : 'Click to mark visited'}
                  >
                    {visited ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Visited</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-3.5 h-3.5" />
                        <span>Mark</span>
                      </>
                    )}
                  </button>

                  <ChevronRight
                    className={`w-4 h-4 transition ${
                      isSelected
                        ? 'text-white'
                        : 'text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5'
                    }`}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
