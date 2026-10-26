import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  MapPin,
  CheckCircle2,
  Circle,
  Eye,
} from 'lucide-react';
import bangladeshGeoData from '../data/bangladeshDistrictsGeo.json';
import { DistrictInfo } from '../types';
import { DISTRICTS_BY_ID } from '../data/districts';

interface MapViewerProps {
  isVisited: (id: string) => boolean;
  selectedDistrictId: string | null;
  onSelectDistrict: (id: string) => void;
  hoveredDistrictId: string | null;
  setHoveredDistrictId: (id: string | null) => void;
}

export const MapViewer: React.FC<MapViewerProps> = ({
  isVisited,
  selectedDistrictId,
  onSelectDistrict,
  hoveredDistrictId,
  setHoveredDistrictId,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [basemapMode, setBasemapMode] = useState<'clean' | 'detailed'>('clean');
  const [isMapReady, setIsMapReady] = useState(false);

  // Bangladesh Bounds: SW [20.6, 88.0], NE [26.7, 92.7]
  const bangladeshBounds = useRef<L.LatLngBoundsExpression>([
    [20.55, 87.95],
    [26.75, 92.75],
  ]);

  // Style calculator for a district feature
  const getFeatureStyle = useCallback(
    (feature: any): L.PathOptions => {
      const id = feature?.properties?.id;
      const visited = isVisited(id);
      const isSelected = selectedDistrictId === id;
      const isHovered = hoveredDistrictId === id;

      if (isSelected) {
        return {
          fillColor: visited ? '#16A34A' : '#E2E8F0',
          fillOpacity: 1,
          weight: 3,
          color: '#0F172A',
          dashArray: '',
          className: 'district-path selected-district',
        };
      }

      if (isHovered) {
        return {
          fillColor: visited ? '#15803D' : '#F1F5F9',
          fillOpacity: 1,
          weight: 2.2,
          color: visited ? '#15803D' : '#64748B',
          dashArray: '',
          className: 'district-path hovered-district',
        };
      }

      return {
        fillColor: visited ? '#22C55E' : '#FFFFFF',
        fillOpacity: visited ? 0.95 : 1,
        weight: 1.2,
        color: visited ? '#15803D' : '#CBD5E1',
        dashArray: '',
        className: 'district-path',
      };
    },
    [isVisited, selectedDistrictId, hoveredDistrictId]
  );

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [23.8, 90.3],
      zoom: 7,
      minZoom: 6,
      maxZoom: 12,
      zoomControl: false,
      attributionControl: false,
      maxBounds: [
        [19.5, 87.0],
        [27.5, 93.5],
      ],
      maxBoundsViscosity: 0.8,
    });

    mapInstanceRef.current = map;

    // Optional subtle Carto basemap for rivers/coasts
    const tileLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
      {
        subdomains: 'abcd',
        maxZoom: 19,
        opacity: 0,
      }
    ).addTo(map);
    tileLayerRef.current = tileLayer;

    // Create GeoJSON Layer
    const geoJsonLayer = L.geoJSON(bangladeshGeoData as any, {
      style: (feature) => getFeatureStyle(feature),
      onEachFeature: (feature, layer) => {
        const id = feature?.properties?.id;
        const name = feature?.properties?.name || '';
        const nameBn = feature?.properties?.nameBn || '';
        const division = feature?.properties?.division || '';

        // Bind custom tooltip
        layer.bindTooltip(
          () => {
            const visited = isVisited(id);
            return `
              <div class="custom-tooltip-content">
                <div class="flex items-center space-x-1.5">
                  <span class="w-2 h-2 rounded-full ${visited ? 'bg-emerald-400' : 'bg-slate-300'}"></span>
                  <span class="font-bold text-sm text-white">${name}</span>
                  <span class="font-bangla text-xs text-slate-300">(${nameBn})</span>
                </div>
                <div class="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between gap-3">
                  <span>${division} Division</span>
                  <span class="${visited ? 'text-emerald-400 font-bold' : 'text-slate-300'}">
                    ${visited ? '✓ Visited' : '○ Not Visited'}
                  </span>
                </div>
              </div>
            `;
          },
          {
            className: 'custom-leaflet-tooltip',
            sticky: true,
            direction: 'top',
            offset: [0, -10],
          }
        );

        // Interaction events
        layer.on({
          mouseover: () => {
            setHoveredDistrictId(id);
          },
          mouseout: () => {
            setHoveredDistrictId(null);
          },
          click: (e) => {
            L.DomEvent.stopPropagation(e);
            onSelectDistrict(id);
          },
        });
      },
    }).addTo(map);

    geoJsonLayerRef.current = geoJsonLayer;

    // Fit Initial View to Bangladesh cleanly
    map.fitBounds(bangladeshBounds.current, {
      padding: [20, 20],
      animate: false,
    });

    setIsMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update GeoJSON layer styles when visited state or selection changes
  useEffect(() => {
    if (!geoJsonLayerRef.current) return;
    geoJsonLayerRef.current.setStyle((feature) => getFeatureStyle(feature));
  }, [getFeatureStyle]);

  // Pan to selected district if selected
  useEffect(() => {
    if (!selectedDistrictId || !mapInstanceRef.current || !geoJsonLayerRef.current) return;

    geoJsonLayerRef.current.eachLayer((layer: any) => {
      if (layer.feature?.properties?.id === selectedDistrictId) {
        // Bring selected layer to front
        if (layer.bringToFront) {
          layer.bringToFront();
        }
      }
    });
  }, [selectedDistrictId]);

  // Basemap style toggle
  const toggleBasemap = () => {
    const next = basemapMode === 'clean' ? 'detailed' : 'clean';
    setBasemapMode(next);
    if (tileLayerRef.current) {
      tileLayerRef.current.setOpacity(next === 'detailed' ? 0.6 : 0);
    }
  };

  // Reset to full Bangladesh view
  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.fitBounds(bangladeshBounds.current, {
      padding: [20, 20],
      animate: true,
    });
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div className="relative w-full h-full min-h-[500px] lg:min-h-[640px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col">
      {/* Map Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full flex-1 z-0" />

      {/* Floating Map Controls Top-Right */}
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200 p-1 flex flex-col space-y-1">
          <button
            onClick={handleZoomIn}
            className="w-9 h-9 flex items-center justify-center text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-9 h-9 flex items-center justify-center text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleResetView}
          className="w-9 h-9 bg-white/95 backdrop-blur-md flex items-center justify-center text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl shadow-md border border-slate-200 transition"
          title="Fit Whole Bangladesh"
          aria-label="Reset View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <button
          onClick={toggleBasemap}
          className={`w-9 h-9 backdrop-blur-md flex items-center justify-center rounded-xl shadow-md border transition ${
            basemapMode === 'detailed'
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
          title={`Map View: ${basemapMode === 'clean' ? 'Pure Canvas (White/Green)' : 'With Physical Coastline/Water'}`}
          aria-label="Toggle Basemap"
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Legend Bottom-Left */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200 p-3 sm:p-3.5 max-w-[240px]">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          Map Legend
        </p>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-4 h-4 rounded bg-emerald-500 border border-emerald-600 shadow-sm shrink-0"></span>
            <span className="font-semibold text-slate-800">Visited District</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-4 h-4 rounded bg-white border border-slate-300 shadow-sm shrink-0"></span>
            <span className="text-slate-600">Unvisited District</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-4 h-4 rounded bg-slate-100 border-2 border-slate-900 shadow-sm shrink-0"></span>
            <span className="text-slate-600">Selected District</span>
          </div>
        </div>
      </div>

      {/* Interactive Helper Banner on Top-Left */}
      <div className="absolute top-4 left-4 z-10 hidden sm:flex items-center space-x-2 bg-white/90 backdrop-blur-md rounded-xl shadow-sm border border-slate-200/90 px-3 py-1.5 text-xs text-slate-600 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        <span>Click any district on the map or in the list to view details</span>
      </div>
    </div>
  );
};
