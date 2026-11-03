import React, { useState } from 'react';
import {
  Compass,
  Download,
  Share2,
  RotateCcw,
  Sparkles,
  MapPin,
  ChevronDown,
  Info,
  Route,
} from 'lucide-react';
import { TravelStats } from '../types';

interface NavbarProps {
  stats: TravelStats;
  onOpenGps: () => void;
  onOpenPassport: () => void;
  onOpenBackup: () => void;
  onLoadDemo: () => void;
  onResetAll: () => void;
  onOpenAbout: () => void;
  onOpenRoutePlanner: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  stats,
  onOpenGps,
  onOpenPassport,
  onOpenBackup,
  onLoadDemo,
  onResetAll,
  onOpenAbout,
  onOpenRoutePlanner,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 text-white shadow-md shadow-emerald-500/20">
              <MapPin className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                  Green <span className="text-emerald-600">Bangladesh</span>
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 font-bangla">
                  আমার ভ্রমণ মানচিত্র
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Interactive 64-District Travel Tracker
              </p>
            </div>
          </div>

          {/* Center Stats Pill (desktop) */}
          <div className="hidden lg:flex items-center space-x-3 bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-full">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                <strong className="text-emerald-600 font-bold">{stats.visited}</strong> / {stats.total} Visited
              </span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="text-xs font-semibold text-slate-600">
              <span className="text-slate-900 font-bold">{stats.percentage}%</span> Explored
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Detect Location (GPS) */}
            <button
              onClick={onOpenGps}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border border-emerald-200/80 transition shadow-sm active:scale-95"
              title="Detect your current district using GPS"
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Detect Location</span>
            </button>

            <button
              onClick={onOpenRoutePlanner}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 transition shadow-sm active:scale-95"
              title="Find driving distance between places in Bangladesh"
            >
              <Route className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Driving Route</span>
            </button>

            {/* Passport & Share */}
            <button
              onClick={onOpenPassport}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition shadow-sm active:scale-95"
              title="View your Travel Passport & share card"
            >
              <Share2 className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Travel Passport</span>
            </button>

            {/* More Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition shadow-sm active:scale-95"
                aria-label="Options Menu"
              >
                <span>Options</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-100 py-1.5 z-40 text-sm">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onOpenBackup();
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-slate-50 text-left font-medium"
                    >
                      <Download className="w-4 h-4 text-slate-400" />
                      <span>Backup & Restore (JSON)</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onLoadDemo();
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-slate-50 text-left font-medium"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Load Sample Demo Journey</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onOpenAbout();
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-slate-50 text-left font-medium"
                    >
                      <Info className="w-4 h-4 text-slate-400" />
                      <span>About Green Bangladesh</span>
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowConfirmReset(true);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 text-left font-medium"
                    >
                      <RotateCcw className="w-4 h-4 text-red-500" />
                      <span>Reset Map to All White</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Resetting */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Reset Map to White?</h3>
            <p className="text-sm text-slate-600 mb-6">
              This will clear all marked visited districts, photos, and notes. You can export a backup first if you want to keep them!
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetAll();
                  setShowConfirmReset(false);
                }}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-md shadow-red-600/20"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
