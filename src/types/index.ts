export interface DistrictInfo {
  id: string;
  shapeName: string;
  name: string;
  nameBn: string;
  division: string;
  divisionBn: string;
  spots: string[];
  highlight: string;
  bbox: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  center: [number, number]; // [lat, lng]
}

export interface DistrictVisit {
  districtId: string;
  visited: boolean;
  visitedDate?: string; // YYYY-MM-DD
  notes?: string;
  photos?: string[]; // Data URLs of photos
  favoriteSpots?: string[];
  rating?: number; // 1 to 5
  updatedAt: string;
}

export interface TravelStats {
  total: number; // 64
  visited: number;
  remaining: number;
  percentage: number;
}

export type StatusFilter = 'all' | 'visited' | 'unvisited';

export type DivisionName =
  | 'All'
  | 'Barishal'
  | 'Chattogram'
  | 'Dhaka'
  | 'Khulna'
  | 'Mymensingh'
  | 'Rajshahi'
  | 'Rangpur'
  | 'Sylhet';

export interface DivisionStat {
  division: string;
  divisionBn: string;
  total: number;
  visited: number;
  percentage: number;
}
