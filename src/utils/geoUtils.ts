import { DistrictInfo } from '../types';

/**
 * Standard ray-casting algorithm to test if [lng, lat] is inside a polygon ring
 */
export function isPointInRing(point: [number, number], ring: number[][]): boolean {
  const [x, y] = point; // [lng, lat]
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Checks if point is inside a GeoJSON geometry (Polygon or MultiPolygon)
 */
export function isPointInGeometry(
  point: [number, number],
  geometry: { type: string; coordinates: any }
): boolean {
  if (geometry.type === 'Polygon') {
    const rings = geometry.coordinates as number[][][];
    if (rings.length === 0) return false;
    // Exterior ring must contain point
    if (!isPointInRing(point, rings[0])) return false;
    // Holes must NOT contain point
    for (let i = 1; i < rings.length; i++) {
      if (isPointInRing(point, rings[i])) return false;
    }
    return true;
  } else if (geometry.type === 'MultiPolygon') {
    const polygons = geometry.coordinates as number[][][][];
    for (const polygon of polygons) {
      if (polygon.length === 0) continue;
      if (isPointInRing(point, polygon[0])) {
        let inHole = false;
        for (let i = 1; i < polygon.length; i++) {
          if (isPointInRing(point, polygon[i])) {
            inHole = true;
            break;
          }
        }
        if (!inHole) return true;
      }
    }
    return false;
  }
  return false;
}

/**
 * Determines which district contains the given lat/lng
 */
export function findDistrictByCoords(
  lat: number,
  lng: number,
  features: Array<{ properties: { id: string }; geometry: any }>
): string | null {
  const point: [number, number] = [lng, lat];
  for (const feature of features) {
    if (isPointInGeometry(point, feature.geometry)) {
      return feature.properties.id;
    }
  }
  return null;
}

/**
 * Approximate distance in kilometers between two lat/lng coordinates (Haversine formula)
 */
export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Checks if coordinates are roughly within Bangladesh bounding box
 */
export function isWithinBangladeshBounds(lat: number, lng: number): boolean {
  // Bangladesh latitude: approx 20.5 to 26.7, longitude: approx 88.0 to 92.7
  return lat >= 20.4 && lat <= 26.8 && lng >= 87.9 && lng <= 92.8;
}

export function formatDate(isoDateStr?: string): string {
  if (!isoDateStr) return 'Not recorded';
  try {
    const [year, month, day] = isoDateStr.split('-');
    if (!year || !month || !day) return isoDateStr;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return isoDateStr;
  }
}
