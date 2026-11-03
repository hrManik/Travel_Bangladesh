import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardSummary } from './components/DashboardSummary';
import { MapViewer } from './components/MapViewer';
import { DistrictSidebar } from './components/DistrictSidebar';
import { DistrictDetailModal } from './components/DistrictDetailModal';
import { GpsLocationModal } from './components/GpsLocationModal';
import { PassportShareModal } from './components/PassportShareModal';
import { BackupModal } from './components/BackupModal';
import { AboutModal } from './components/AboutModal';
import { RoutePlannerModal } from './components/RoutePlannerModal';
import { useTravelData } from './hooks/useTravelData';
import { DISTRICTS_BY_ID } from './data/districts';
import { StatusFilter, DivisionName } from './types';
import { Map as MapIcon, List, Compass, Sparkles } from 'lucide-react';

export default function App() {
  const {
    visits,
    stats,
    divisionStats,
    isVisited,
    getVisit,
    toggleVisited,
    saveVisitDetails,
    removeVisit,
    resetAll,
    loadDemo,
    exportJSON,
    importJSON,
  } = useTravelData();

  // Selected & Hovered District
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [hoveredDistrictId, setHoveredDistrictId] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedDivision, setSelectedDivision] = useState<DivisionName>('All');

  // Modals state
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isGpsOpen, setIsGpsOpen] = useState(false);
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isRoutePlannerOpen, setIsRoutePlannerOpen] = useState(false);

  // Mobile view tab toggle ('map' | 'districts')
  const [mobileTab, setMobileTab] = useState<'map' | 'districts'>('map');

  useEffect(() => {
    const districtId = new URLSearchParams(window.location.search).get('district');
    if (districtId && DISTRICTS_BY_ID[districtId]) {
      setSelectedDistrictId(districtId);
      setIsDetailOpen(true);
    }
  }, []);

  const handleSelectDistrict = (id: string) => {
    setSelectedDistrictId(id);
    setIsDetailOpen(true);
  };

  const handleConfirmGpsVisit = (districtId: string) => {
    toggleVisited(districtId);
    setSelectedDistrictId(districtId);
    setIsDetailOpen(true);
  };

  const activeDistrictInfo = selectedDistrictId
    ? DISTRICTS_BY_ID[selectedDistrictId] || null
    : null;
  const activeVisitRecord = selectedDistrictId
    ? getVisit(selectedDistrictId)
    : undefined;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Navigation */}
      <Navbar
        stats={stats}
        onOpenGps={() => setIsGpsOpen(true)}
        onOpenPassport={() => setIsPassportOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        onLoadDemo={loadDemo}
        onResetAll={resetAll}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenRoutePlanner={() => setIsRoutePlannerOpen(true)}
      />

      {/* Travel Dashboard Summary */}
      <DashboardSummary
        stats={stats}
        divisionStats={divisionStats}
        activeDivision={selectedDivision}
        onSelectDivision={(div) => {
          setSelectedDivision(div);
          if (div !== 'All') {
            // Also switch to districts view on mobile when tapping a division
            setMobileTab('districts');
          }
        }}
      />

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2 sticky top-16 z-20">
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setMobileTab('map')}
            className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition ${
              mobileTab === 'map'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span>Interactive Map</span>
          </button>
          <button
            onClick={() => setMobileTab('districts')}
            className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition ${
              mobileTab === 'districts'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Districts List ({stats.total})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-stretch">
          {/* Map Viewer Column (7 cols on lg, 8 on xl) */}
          <div
            className={`lg:col-span-7 xl:col-span-8 flex flex-col ${
              mobileTab === 'map' ? 'block' : 'hidden lg:flex'
            }`}
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Bangladesh Travel Map
                </h2>
                <span className="text-xs text-slate-400">
                  • 64 Districts
                </span>
              </div>
              <div className="flex items-center space-x-3 text-xs font-semibold text-slate-500">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Green = Visited</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-white border border-slate-300"></span>
                  <span>White = Unvisited</span>
                </span>
              </div>
            </div>

            <div className="flex-1 h-[520px] sm:h-[620px] lg:h-[720px]">
              <MapViewer
                isVisited={isVisited}
                selectedDistrictId={selectedDistrictId}
                onSelectDistrict={handleSelectDistrict}
                hoveredDistrictId={hoveredDistrictId}
                setHoveredDistrictId={setHoveredDistrictId}
              />
            </div>
          </div>

          {/* District Directory Sidebar Column (5 cols on lg, 4 on xl) */}
          <div
            className={`lg:col-span-5 xl:col-span-4 flex flex-col ${
              mobileTab === 'districts' ? 'block' : 'hidden lg:flex'
            } h-[620px] lg:h-[760px]`}
          >
            <DistrictSidebar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              selectedDivision={selectedDivision}
              setSelectedDivision={setSelectedDivision}
              selectedDistrictId={selectedDistrictId}
              onSelectDistrict={handleSelectDistrict}
              isVisited={isVisited}
              onToggleVisited={(id) => toggleVisited(id)}
              hoveredDistrictId={hoveredDistrictId}
              setHoveredDistrictId={setHoveredDistrictId}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">Green Bangladesh</span>
            <span>—</span>
            <span className="font-bangla">আমার ভ্রমণ মানচিত্র</span>
            <span>•</span>
            <span>64 Administrative Districts</span>
            <span>•</span>
            <span>© {new Date().getFullYear()} Manik. All rights reserved.</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsAboutOpen(true)}
              className="hover:text-emerald-600 transition"
            >
              About & Methodology
            </button>
            <button
              onClick={() => setIsBackupOpen(true)}
              className="hover:text-emerald-600 transition"
            >
              Export / Import
            </button>
            <button
              onClick={() => setIsPassportOpen(true)}
              className="hover:text-emerald-600 transition"
            >
              Share Passport
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DistrictDetailModal
        district={activeDistrictInfo}
        visit={activeVisitRecord}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onToggleVisited={toggleVisited}
        onSaveDetails={saveVisitDetails}
        onRemoveRecord={removeVisit}
      />

      <GpsLocationModal
        isOpen={isGpsOpen}
        onClose={() => setIsGpsOpen(false)}
        onConfirmVisit={handleConfirmGpsVisit}
        isVisited={isVisited}
      />

      <PassportShareModal
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
        stats={stats}
        divisionStats={divisionStats}
        visits={visits}
      />

      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        stats={stats}
        onExport={exportJSON}
        onImport={importJSON}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      <RoutePlannerModal
        isOpen={isRoutePlannerOpen}
        onClose={() => setIsRoutePlannerOpen(false)}
      />
    </div>
  );
}
