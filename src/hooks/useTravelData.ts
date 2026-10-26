import { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { DistrictVisit, TravelStats, DivisionStat } from '../types';
import { DISTRICTS, DIVISIONS, DEMO_VISITED_IDS } from '../data/districts';

const STORAGE_KEY = 'green_bangladesh_travel_visits_v1';

export function fireCelebrationConfetti() {
  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#22C55E', '#16A34A', '#15803D', '#FFFFFF', '#F59E0B'],
    });
  } catch {
    // Canvas confetti gracefully fails if canvas not supported
  }
}

export function fireMajorMilestoneConfetti() {
  try {
    const end = Date.now() + 1500;
    const interval: any = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }
      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#22C55E', '#10B981', '#3B82F6', '#F59E0B'],
      });
    }, 200);
  } catch {
    // Graceful fallback
  }
}

export function useTravelData() {
  const [visits, setVisits] = useState<Record<string, DistrictVisit>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse stored visits:', e);
    }
    return {};
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));
    } catch (e) {
      console.error('Failed to save visits to localStorage:', e);
    }
  }, [visits]);

  const isVisited = useCallback(
    (districtId: string): boolean => {
      return Boolean(visits[districtId]?.visited);
    },
    [visits]
  );

  const getVisit = useCallback(
    (districtId: string): DistrictVisit | undefined => {
      return visits[districtId];
    },
    [visits]
  );

  const toggleVisited = useCallback(
    (districtId: string, customDate?: string) => {
      setVisits((prev) => {
        const current = prev[districtId];
        const nextVisited = !current?.visited;
        const now = new Date().toISOString().split('T')[0];

        if (nextVisited) {
          fireCelebrationConfetti();
        }

        return {
          ...prev,
          [districtId]: {
            districtId,
            visited: nextVisited,
            visitedDate: nextVisited
              ? customDate || current?.visitedDate || now
              : current?.visitedDate,
            notes: current?.notes || '',
            photos: current?.photos || [],
            favoriteSpots: current?.favoriteSpots || [],
            rating: current?.rating || 5,
            updatedAt: new Date().toISOString(),
          },
        };
      });
    },
    []
  );

  const saveVisitDetails = useCallback(
    (
      districtId: string,
      details: {
        visited: boolean;
        visitedDate?: string;
        notes?: string;
        photos?: string[];
        favoriteSpots?: string[];
        rating?: number;
      }
    ) => {
      setVisits((prev) => {
        const wasVisited = prev[districtId]?.visited;
        if (!wasVisited && details.visited) {
          fireCelebrationConfetti();
        }

        return {
          ...prev,
          [districtId]: {
            districtId,
            visited: details.visited,
            visitedDate: details.visitedDate || new Date().toISOString().split('T')[0],
            notes: details.notes ?? prev[districtId]?.notes ?? '',
            photos: details.photos ?? prev[districtId]?.photos ?? [],
            favoriteSpots: details.favoriteSpots ?? prev[districtId]?.favoriteSpots ?? [],
            rating: details.rating ?? prev[districtId]?.rating ?? 5,
            updatedAt: new Date().toISOString(),
          },
        };
      });
    },
    []
  );

  const removeVisit = useCallback((districtId: string) => {
    setVisits((prev) => {
      const next = { ...prev };
      delete next[districtId];
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    setVisits({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const loadDemo = useCallback(() => {
    const demoVisits: Record<string, DistrictVisit> = {};
    const sampleDates = [
      '2023-01-15',
      '2023-03-22',
      '2023-07-04',
      '2023-11-18',
      '2024-02-10',
      '2024-05-19',
      '2024-09-08',
      '2024-12-25',
      '2025-01-14',
      '2025-04-12',
      '2025-08-20',
      '2025-10-15',
      '2025-11-28',
      '2026-02-14',
    ];

    DEMO_VISITED_IDS.forEach((id, idx) => {
      const d = DISTRICTS.find((item) => item.id === id);
      demoVisits[id] = {
        districtId: id,
        visited: true,
        visitedDate: sampleDates[idx % sampleDates.length],
        notes: `Explored the breathtaking sights of ${d?.name || id}. Highly recommended for nature and cultural heritage!`,
        favoriteSpots: d?.spots.slice(0, 2) || [],
        rating: 5,
        updatedAt: new Date().toISOString(),
      };
    });

    setVisits(demoVisits);
    fireMajorMilestoneConfetti();
  }, []);

  const exportJSON = useCallback(() => {
    const exportData = {
      app: 'Green Bangladesh',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      totalDistricts: 64,
      visitedCount: Object.values(visits).filter((v) => v.visited).length,
      visits,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `green-bangladesh-travel-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [visits]);

  const importJSON = useCallback((jsonString: string): { success: boolean; count?: number; error?: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: 'Invalid JSON format' };
      }

      // Can be direct visits object or wrapped exportData
      const visitsData: Record<string, any> = parsed.visits || parsed;
      const validVisits: Record<string, DistrictVisit> = {};
      let validCount = 0;

      Object.entries(visitsData).forEach(([key, val]) => {
        if (val && typeof val === 'object' && val.visited) {
          validVisits[key] = {
            districtId: key,
            visited: true,
            visitedDate: val.visitedDate || new Date().toISOString().split('T')[0],
            notes: val.notes || '',
            photos: Array.isArray(val.photos) ? val.photos : [],
            favoriteSpots: Array.isArray(val.favoriteSpots) ? val.favoriteSpots : [],
            rating: typeof val.rating === 'number' ? val.rating : 5,
            updatedAt: val.updatedAt || new Date().toISOString(),
          };
          validCount++;
        }
      });

      setVisits(validVisits);
      fireMajorMilestoneConfetti();
      return { success: true, count: validCount };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to parse file' };
    }
  }, []);

  const stats: TravelStats = useMemo(() => {
    const visitedCount = DISTRICTS.filter((d) => visits[d.id]?.visited).length;
    const remaining = 64 - visitedCount;
    const percentage = Math.round((visitedCount / 64) * 1000) / 10;
    return {
      total: 64,
      visited: visitedCount,
      remaining,
      percentage,
    };
  }, [visits]);

  const divisionStats: DivisionStat[] = useMemo(() => {
    return DIVISIONS.map((div) => {
      const divDistricts = DISTRICTS.filter((d) => d.division === div.en);
      const visitedInDiv = divDistricts.filter((d) => visits[d.id]?.visited).length;
      return {
        division: div.en,
        divisionBn: div.bn,
        total: divDistricts.length,
        visited: visitedInDiv,
        percentage: Math.round((visitedInDiv / divDistricts.length) * 100),
      };
    });
  }, [visits]);

  return {
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
  };
}
