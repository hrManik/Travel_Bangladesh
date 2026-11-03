import React, { FormEvent, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Clock3, MapPin, Route, Search, X } from 'lucide-react';

interface RoutePlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GeocodingResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface RouteResult {
  coordinates: [number, number][];
  distanceKm: number;
  durationMinutes: number;
  fromName: string;
  toName: string;
  steps: Array<{ instruction: string; distanceKm: number }>;
}

function delay(milliseconds: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const handleAbort = () => {
      window.clearTimeout(timeout);
      reject(new DOMException('The request was cancelled.', 'AbortError'));
    };
    const timeout = window.setTimeout(() => {
      signal.removeEventListener('abort', handleAbort);
      resolve();
    }, milliseconds);
    signal.addEventListener('abort', handleAbort, { once: true });
    if (signal.aborted) handleAbort();
  });
}

async function geocodePlace(query: string, signal: AbortSignal): Promise<GeocodingResult> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '1');
  url.searchParams.set('countrycodes', 'bd');
  url.searchParams.set('q', query);

  const response = await fetch(url, {
    signal,
    headers: { 'Accept-Language': 'en' },
  });
  if (!response.ok) {
    throw new Error('Could not search for places right now. Please try again later.');
  }

  const results = (await response.json()) as GeocodingResult[];
  if (!results.length) {
    throw new Error(`No Bangladesh location found for “${query}”. Try a nearby town or address.`);
  }
  return results[0];
}

function formatManeuver(
  type: string,
  modifier: string | undefined,
  roadName: string,
  exit: number | undefined
): string {
  const direction = modifier?.replaceAll('_', ' ');
  let instruction: string;

  switch (type) {
    case 'depart':
      instruction = 'Start driving';
      break;
    case 'arrive':
      instruction = 'Arrive at your destination';
      break;
    case 'turn':
      instruction = `Turn ${direction || 'ahead'}`;
      break;
    case 'fork':
      instruction = `At the fork, keep ${direction || 'ahead'}`;
      break;
    case 'merge':
      instruction = `Merge ${direction || 'ahead'}`;
      break;
    case 'on ramp':
      instruction = `Take the ramp${direction ? ` ${direction}` : ''}`;
      break;
    case 'off ramp':
    case 'exit':
      instruction = `Take the exit${direction ? ` ${direction}` : ''}`;
      break;
    case 'roundabout':
    case 'rotary':
      instruction = `At the ${type}${exit ? `, take exit ${exit}` : ''}`;
      break;
    case 'exit roundabout':
    case 'exit rotary':
      instruction = `Exit the ${type.endsWith('roundabout') ? 'roundabout' : 'rotary'}${direction ? ` ${direction}` : ''}`;
      break;
    case 'end of road':
      instruction = `At the end of the road, turn ${direction || 'ahead'}`;
      break;
    case 'new name':
    case 'continue':
      instruction = `Continue${direction && direction !== 'straight' ? ` ${direction}` : ''}`;
      break;
    default:
      instruction = type.replaceAll('_', ' ');
      instruction = instruction.charAt(0).toUpperCase() + instruction.slice(1);
      if (direction) instruction += ` ${direction}`;
  }

  return roadName ? `${instruction} onto ${roadName}` : instruction;
}

export const RoutePlannerModal: React.FC<RoutePlannerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastGeocodeRequestAtRef = useRef(0);

  useEffect(() => {
    if (!isOpen || !mapElementRef.current || mapRef.current) return;

    const map = L.map(mapElementRef.current, {
      center: [23.8, 90.3],
      zoom: 7,
      minZoom: 6,
      maxZoom: 18,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    mapRef.current = map;
    markersRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
      routeLayerRef.current = null;
      markersRef.current = null;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!route || !mapRef.current || !markersRef.current) return;
    markersRef.current.clearLayers();
    routeLayerRef.current?.remove();

    const originPoint = route.coordinates[0];
    const destinationPoint = route.coordinates[route.coordinates.length - 1];
    L.marker(originPoint)
      .bindPopup(`<strong>Start</strong><br>${route.fromName}`)
      .addTo(markersRef.current);
    L.marker(destinationPoint)
      .bindPopup(`<strong>Destination</strong><br>${route.toName}`)
      .addTo(markersRef.current);
    routeLayerRef.current = L.polyline(route.coordinates, {
      color: '#059669',
      weight: 5,
      opacity: 0.9,
    }).addTo(mapRef.current);
    mapRef.current.fitBounds(routeLayerRef.current.getBounds(), {
      padding: [30, 30],
    });
  }, [route]);

  useEffect(() => {
    if (!isOpen) {
      abortControllerRef.current?.abort();
      return;
    }
    return () => abortControllerRef.current?.abort();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFindRoute = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsLoading(true);
    setErrorMessage('');
    setRoute(null);

    try {
      if (!origin.trim() || !destination.trim()) {
        throw new Error('Enter both a starting place and destination.');
      }

      const searchPlace = async (place: string) => {
        const remainingWait = 1100 - (Date.now() - lastGeocodeRequestAtRef.current);
        if (remainingWait > 0) await delay(remainingWait, controller.signal);
        lastGeocodeRequestAtRef.current = Date.now();
        return geocodePlace(place, controller.signal);
      };
      const start = await searchPlace(origin.trim());
      const end = await searchPlace(destination.trim());
      const routeUrl = new URL(
        `https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}`
      );
      routeUrl.searchParams.set('overview', 'full');
      routeUrl.searchParams.set('geometries', 'geojson');
      routeUrl.searchParams.set('steps', 'true');
      const response = await fetch(routeUrl, { signal: controller.signal });
      if (!response.ok) {
        throw new Error('The driving route service is unavailable. Please try again later.');
      }

      const result = (await response.json()) as {
        code: string;
        routes?: Array<{
          distance: number;
          duration: number;
          geometry: { coordinates: [number, number][] };
          legs: Array<{
            steps: Array<{
              distance: number;
              name: string;
              maneuver: { type: string; modifier?: string; exit?: number };
            }>;
          }>;
        }>;
      };
      const firstRoute = result.routes?.[0];
      if (
        result.code !== 'Ok' ||
        !firstRoute ||
        firstRoute.geometry.coordinates.length < 2
      ) {
        throw new Error('No driving route was found between those places.');
      }

      setRoute({
        coordinates: firstRoute.geometry.coordinates.map(([longitude, latitude]) => [
          latitude,
          longitude,
        ]),
        distanceKm: firstRoute.distance / 1000,
        durationMinutes: firstRoute.duration / 60,
        fromName: start.display_name,
        toName: end.display_name,
        steps: firstRoute.legs.flatMap((leg) =>
          leg.steps.map((step) => {
            return {
              instruction: formatManeuver(
                step.maneuver.type,
                step.maneuver.modifier,
                step.name,
                step.maneuver.exit
              ),
              distanceKm: step.distance / 1000,
            };
          })
        ),
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setErrorMessage(
        error instanceof Error ? error.message : 'Could not calculate the driving route.'
      );
    } finally {
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="route-planner-title"
        className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between border-b border-slate-200 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Route className="h-5 w-5" />
            </span>
            <div>
              <h2 id="route-planner-title" className="text-lg font-bold text-slate-900">
                Bangladesh Driving Route
              </h2>
              <p className="text-xs text-slate-500">
                Find road distance and directions on the map. No live traffic or GPS navigation.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close route planner"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto p-4 sm:p-5 lg:grid-cols-[320px_1fr]">
          <div className="space-y-4">
            <form onSubmit={handleFindRoute} className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Starting place
                <input
                  required
                  minLength={2}
                  value={origin}
                  onChange={(event) => setOrigin(event.target.value)}
                  placeholder="e.g. Dhaka Airport"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </label>
              <label className="block text-xs font-bold text-slate-700">
                Destination
                <input
                  required
                  minLength={2}
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  placeholder="e.g. Cox's Bazar Beach"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </label>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {isLoading ? 'Finding route…' : 'Find driving route'}
              </button>
            </form>

            {errorMessage && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {errorMessage}
              </p>
            )}

            {route && (
              <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                  <MapPin className="h-4 w-4" />
                  {route.distanceKm.toFixed(1)} km
                </p>
                <p className="mt-1 flex items-center gap-2 text-xs text-emerald-800">
                  <Clock3 className="h-3.5 w-3.5" />
                  About {Math.round(route.durationMinutes)} minutes driving
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-emerald-800">
                  Estimated route only. Check local road conditions and signs before travelling.
                </p>
                <ol className="mt-3 max-h-52 space-y-2 overflow-y-auto border-t border-emerald-200 pt-3">
                  {route.steps.map((step, index) => (
                    <li key={`${index}-${step.instruction}`} className="flex gap-2 text-[11px] text-slate-700">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white font-bold text-emerald-800">
                        {index + 1}
                      </span>
                      <span className="flex-1 leading-relaxed">{step.instruction}</span>
                      <span className="shrink-0 text-slate-500">
                        {step.distanceKm >= 1
                          ? `${step.distanceKm.toFixed(1)} km`
                          : `${Math.round(step.distanceKm * 1000)} m`}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <p className="text-[11px] leading-relaxed text-slate-500">
              Place search by OpenStreetMap Nominatim. Driving routes by the OSRM demo service.
              Map data © OpenStreetMap contributors. These community services may be unavailable
              or have usage limits.
            </p>
          </div>

          <div className="min-h-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 lg:min-h-[520px]">
            <div ref={mapElementRef} className="h-full min-h-[360px] w-full lg:min-h-[520px]" />
          </div>
        </div>
      </section>
    </div>
  );
};
