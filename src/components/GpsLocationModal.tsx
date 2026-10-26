import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  ShieldCheck,
  Navigation,
} from 'lucide-react';
import { findDistrictByCoords, isWithinBangladeshBounds } from '../utils/geoUtils';
import bangladeshGeoData from '../data/bangladeshDistrictsGeo.json';
import { DISTRICTS, DISTRICTS_BY_ID } from '../data/districts';
import { DistrictInfo } from '../types';

interface GpsLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmVisit: (districtId: string) => void;
  isVisited: (id: string) => boolean;
}

export const GpsLocationModal: React.FC<GpsLocationModalProps> = ({
  isOpen,
  onClose,
  onConfirmVisit,
  isVisited,
}) => {
  if (!isOpen) return null;

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [detectedDistrict, setDetectedDistrict] = useState<DistrictInfo | null>(null);
  const [isOutsideBangladesh, setIsOutsideBangladesh] = useState(false);

  const handleStartDetection = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your current browser.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setDetectedDistrict(null);
    setIsOutsideBangladesh(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCoords({ lat, lng });

        // Point-in-polygon check against all 64 districts GeoJSON
        const matchedId = findDistrictByCoords(lat, lng, bangladeshGeoData.features as any);

        if (matchedId && DISTRICTS_BY_ID[matchedId]) {
          setDetectedDistrict(DISTRICTS_BY_ID[matchedId]);
          setIsOutsideBangladesh(false);
        } else {
          // Check if roughly outside Bangladesh
          const isInsideBorders = isWithinBangladeshBounds(lat, lng);
          if (!isInsideBorders) {
            setIsOutsideBangladesh(true);
          } else {
            // Find closest district centroid
            let closestId = 'dhaka';
            let minDistance = Infinity;
            DISTRICTS.forEach((d) => {
              const dist = Math.hypot(d.center[0] - lat, d.center[1] - lng);
              if (dist < minDistance) {
                minDistance = dist;
                closestId = d.id;
              }
            });
            setDetectedDistrict(DISTRICTS_BY_ID[closestId]);
          }
        }
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setErrorMsg(
            'Location permission was denied. Please allow location access in your browser settings to detect your district.'
          );
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setErrorMsg('Location information is currently unavailable.');
        } else if (err.code === err.TIMEOUT) {
          setErrorMsg('The request to determine your location timed out.');
        } else {
          setErrorMsg(err.message || 'An unknown error occurred while requesting location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleConfirm = () => {
    if (detectedDistrict) {
      onConfirmVisit(detectedDistrict.id);
      onClose();
    }
  };

  const handleSimulateDistrict = (id: string) => {
    const dist = DISTRICTS_BY_ID[id];
    if (dist) {
      setCoords({ lat: dist.center[0], lng: dist.center[1] });
      setDetectedDistrict(dist);
      setIsOutsideBangladesh(false);
      setErrorMsg(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Compass className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Detect My Location (GPS)
              </h3>
              <p className="text-xs text-slate-500">
                Identify your district using browser coordinates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Privacy Note */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 mb-5 flex items-start space-x-2.5 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            <strong>Privacy Guarantee:</strong> Coordinates are evaluated locally on your device using boundary polygons. Your location is never sent to any server or tracked continuously.
          </p>
        </div>

        {/* Initial Action or Result State */}
        {!detectedDistrict && !isOutsideBangladesh && (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Navigation className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Ready to find which district you are in?
              </p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                Click below to request GPS location. You will be able to review and confirm before anything is marked.
              </p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-200 flex items-start space-x-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              onClick={handleStartDetection}
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Determining GPS Coordinates...</span>
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4" />
                  <span>Detect My District Now</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Detected Inside Bangladesh District */}
        {detectedDistrict && (
          <div className="space-y-4 py-2">
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-sm">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                  Location Detected!
                </span>
                <h4 className="text-2xl font-black text-slate-900">
                  {detectedDistrict.name}
                </h4>
                <p className="text-sm font-bangla text-slate-600 font-semibold">
                  {detectedDistrict.nameBn} জেলা • {detectedDistrict.division} বিভাগ
                </p>
              </div>

              {coords && (
                <p className="text-[11px] text-slate-500 font-mono">
                  GPS: {coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E
                </p>
              )}

              <div className="pt-2">
                {isVisited(detectedDistrict.id) ? (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-200 text-emerald-900">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Already Marked as Visited!</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800">
                    <span>Not Visited Yet</span>
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-600 text-center">
              Would you like to confirm and turn{' '}
              <strong>{detectedDistrict.name}</strong> green on your map?
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Mark Green</span>
              </button>
            </div>
          </div>
        )}

        {/* Detected Outside Bangladesh */}
        {isOutsideBangladesh && (
          <div className="space-y-4 py-2">
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto shadow-sm">
                <Navigation className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Location is Outside Bangladesh
              </h4>
              {coords && (
                <p className="text-xs text-slate-600 font-mono">
                  Coordinates: {coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E
                </p>
              )}
              <p className="text-xs text-slate-600 leading-relaxed">
                You are currently located outside Bangladesh's borders. You can simulate testing the feature with a popular district below:
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 justify-center">
              {['dhaka', 'coxs-bazar', 'sylhet', 'bogura', 'barishal'].map((id) => (
                <button
                  key={id}
                  onClick={() => handleSimulateDistrict(id)}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg border border-slate-200 transition"
                >
                  Simulate {DISTRICTS_BY_ID[id]?.name}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
