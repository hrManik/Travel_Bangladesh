import React from 'react';
import {
  MapPin,
  CheckCircle2,
  CircleDashed,
  Percent,
  Compass,
  Trophy,
  Sparkles,
} from 'lucide-react';
import { TravelStats, DivisionStat, DivisionName } from '../types';

interface DashboardSummaryProps {
  stats: TravelStats;
  divisionStats: DivisionStat[];
  activeDivision: DivisionName;
  onSelectDivision: (division: DivisionName) => void;
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  stats,
  divisionStats,
  activeDivision,
  onSelectDivision,
}) => {
  // Determine traveler rank based on percentage
  const getTravelerRank = (pct: number) => {
    if (pct === 100) return { title: 'Green Bangladesh Champion', icon: Trophy, color: 'text-amber-500' };
    if (pct >= 75) return { title: 'Master Voyager of Bengal', icon: Trophy, color: 'text-emerald-600' };
    if (pct >= 50) return { title: 'Seasoned Wanderer', icon: Sparkles, color: 'text-emerald-500' };
    if (pct >= 25) return { title: 'River & Hill Explorer', icon: Compass, color: 'text-blue-500' };
    if (pct > 0) return { title: 'Budding Traveler', icon: MapPin, color: 'text-teal-500' };
    return { title: 'Journey Awaits (Start Exploring)', icon: CircleDashed, color: 'text-slate-400' };
  };

  const rank = getTravelerRank(stats.percentage);
  const RankIcon = rank.icon;

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-5">
          {/* Total Districts */}
          <div className="bg-slate-50/80 rounded-xl p-3.5 sm:p-4 border border-slate-200/90 flex items-center space-x-3 transition hover:border-slate-300">
            <div className="w-10 h-10 rounded-lg bg-slate-200/70 text-slate-700 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Districts
              </p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {stats.total}
              </p>
            </div>
          </div>

          {/* Districts Visited */}
          <div className="bg-emerald-50/70 rounded-xl p-3.5 sm:p-4 border border-emerald-200/80 flex items-center space-x-3 transition hover:border-emerald-300">
            <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                Districts Visited
              </p>
              <div className="flex items-baseline space-x-1">
                <span className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight">
                  {stats.visited}
                </span>
                <span className="text-xs font-semibold text-emerald-700/70">/ {stats.total}</span>
              </div>
            </div>
          </div>

          {/* Districts Remaining */}
          <div className="bg-slate-50/80 rounded-xl p-3.5 sm:p-4 border border-slate-200/90 flex items-center space-x-3 transition hover:border-slate-300">
            <div className="w-10 h-10 rounded-lg bg-slate-200/70 text-slate-600 flex items-center justify-center shrink-0">
              <CircleDashed className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Remaining
              </p>
              <p className="text-xl sm:text-2xl font-black text-slate-700 tracking-tight">
                {stats.remaining}
              </p>
            </div>
          </div>

          {/* Percentage Explored */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50/70 rounded-xl p-3.5 sm:p-4 border border-emerald-200/80 flex items-center space-x-3 transition hover:border-emerald-300">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/20">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                Explored
              </p>
              <p className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">
                {stats.percentage}%
              </p>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar & Milestone Status */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/90">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center space-x-2">
              <RankIcon className={`w-4 h-4 ${rank.color}`} />
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {rank.title}
              </span>
              <span className="text-xs text-slate-500">
                ({stats.visited} of 64 districts turned green)
              </span>
            </div>
            <div className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
              {stats.percentage}% of Bangladesh
            </div>
          </div>

          {/* Progress Bar Track */}
          <div className="relative w-full h-3.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 rounded-full transition-all duration-700 ease-out shadow-sm"
              style={{ width: `${Math.max(stats.percentage, 1)}%` }}
            />
          </div>

          {/* Milestone markers */}
          <div className="flex justify-between items-center text-[11px] font-medium text-slate-400 mt-2 px-1">
            <span className={stats.visited >= 0 ? 'text-slate-600 font-semibold' : ''}>0</span>
            <span className={stats.visited >= 16 ? 'text-emerald-700 font-semibold' : ''}>16 (25%)</span>
            <span className={stats.visited >= 32 ? 'text-emerald-700 font-semibold' : ''}>32 (50%)</span>
            <span className={stats.visited >= 48 ? 'text-emerald-700 font-semibold' : ''}>48 (75%)</span>
            <span className={stats.visited === 64 ? 'text-emerald-700 font-bold' : ''}>64 (100% Green)</span>
          </div>
        </div>

        {/* Division Breakdown Quick Filters */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Explore by Division (বিভাগ)
            </span>
            <span className="text-xs text-slate-400">Click a division to filter list & focus</span>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 scrollbar-thin">
            <button
              onClick={() => onSelectDivision('All')}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeDivision === 'All'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              All Bangladesh ({stats.visited}/{stats.total})
            </button>

            {divisionStats.map((div) => {
              const isSelected = activeDivision === div.division;
              const isAllVisited = div.visited === div.total;
              return (
                <button
                  key={div.division}
                  onClick={() => onSelectDivision(div.division as DivisionName)}
                  className={`shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : isAllVisited
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{div.division}</span>
                  <span className="font-bangla opacity-85">({div.divisionBn})</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                      isSelected
                        ? 'bg-emerald-800 text-white'
                        : isAllVisited
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {div.visited}/{div.total}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
