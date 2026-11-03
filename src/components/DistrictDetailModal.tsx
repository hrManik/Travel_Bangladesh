import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Calendar,
  CheckCircle2,
  Circle,
  Star,
  MapPin,
  Camera,
  Trash2,
  Save,
  Compass,
  Sparkles,
  Info,
  Clock,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import { DistrictInfo, DistrictVisit } from '../types';
import { formatDate } from '../utils/geoUtils';

interface DistrictDetailModalProps {
  district: DistrictInfo | null;
  visit: DistrictVisit | undefined;
  isOpen: boolean;
  onClose: () => void;
  onToggleVisited: (id: string, customDate?: string) => void;
  onSaveDetails: (
    id: string,
    details: {
      visited: boolean;
      visitedDate?: string;
      notes?: string;
      photos?: string[];
      favoriteSpots?: string[];
      rating?: number;
    }
  ) => void;
  onRemoveRecord: (id: string) => void;
}

export const DistrictDetailModal: React.FC<DistrictDetailModalProps> = ({
  district,
  visit,
  isOpen,
  onClose,
  onToggleVisited,
  onSaveDetails,
  onRemoveRecord,
}) => {
  const isVisited = Boolean(visit?.visited);
  const [visitedDate, setVisitedDate] = useState<string>(
    visit?.visitedDate || new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>(visit?.notes || '');
  const [rating, setRating] = useState<number>(visit?.rating || 5);
  const [favoriteSpots, setFavoriteSpots] = useState<string[]>(
    visit?.favoriteSpots || []
  );
  const [photos, setPhotos] = useState<string[]>(visit?.photos || []);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever district changes
  useEffect(() => {
    if (district) {
      setVisitedDate(visit?.visitedDate || new Date().toISOString().split('T')[0]);
      setNotes(visit?.notes || '');
      setRating(visit?.rating || 5);
      setFavoriteSpots(visit?.favoriteSpots || []);
      setPhotos(visit?.photos || []);
      setSaveSuccess(false);
      setShareMessage('');
    }
  }, [district, visit]);

  if (!isOpen || !district) return null;

  const shareUrl = new URL(import.meta.env.BASE_URL, window.location.origin);
  shareUrl.searchParams.set('district', district.id);
  const shareCaption = [
    `🇧🇩 I visited ${district.name} (${district.nameBn}) in ${district.division} Division!`,
    `📅 Visit date: ${formatDate(visitedDate)}`,
    favoriteSpots.length > 0
      ? `📍 Places I explored: ${favoriteSpots.join(', ')}`
      : '',
    'Tracking my Bangladesh journey with Green Bangladesh.',
  ]
    .filter(Boolean)
    .join('\n');
  const shareText = `${shareCaption}\n${shareUrl.toString()}`;

  const handleCopyShareText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setShareMessage('Caption and visit link copied. Paste them into Instagram or any app.');
    } catch {
      setShareMessage('Could not copy to clipboard. Please check your browser permissions and try again.');
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: `My visit to ${district.name}`,
        text: shareCaption,
        url: shareUrl.toString(),
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setShareMessage('Sharing failed. You can copy the caption and link instead.');
    }
  };

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      // Limit to 3MB per photo for fast local storage
      if (file.size > 3 * 1024 * 1024) {
        alert('Photo size exceeds 3MB limit. Please choose a smaller photo.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSpot = (spot: string) => {
    setFavoriteSpots((prev) =>
      prev.includes(spot) ? prev.filter((s) => s !== spot) : [...prev, spot]
    );
  };

  const handleSave = () => {
    onSaveDetails(district.id, {
      visited: true,
      visitedDate,
      notes,
      photos,
      favoriteSpots,
      rating,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleToggleVisitedStatus = () => {
    if (isVisited) {
      onToggleVisited(district.id);
    } else {
      onSaveDetails(district.id, {
        visited: true,
        visitedDate,
        notes,
        photos,
        favoriteSpots,
        rating,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header Banner */}
        <div className={`p-5 sm:p-6 transition-colors border-b ${
          isVisited
            ? 'bg-gradient-to-r from-emerald-600 to-green-700 text-white border-emerald-700'
            : 'bg-gradient-to-r from-slate-800 to-slate-900 text-white border-slate-700'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-white/20 text-white backdrop-blur-sm">
                  {district.division} Division (বিভাগ)
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center space-x-1 ${
                  isVisited ? 'bg-white text-emerald-800' : 'bg-slate-700 text-slate-300'
                }`}>
                  {isVisited ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>VISITED (সবুজ)</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-3 h-3" />
                      <span>UNVISITED (সাদা)</span>
                    </>
                  )}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {district.name}
              </h2>
              <p className="text-base sm:text-lg font-bangla opacity-90">
                {district.nameBn} জেলা
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Mark Visited / Unvisited Button */}
          <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/15">
            <p className="text-xs text-white/80">
              {isVisited
                ? `Visited on ${formatDate(visit?.visitedDate)}`
                : 'Not visited yet. Ready to turn this district green?'}
            </p>
            <button
              onClick={handleToggleVisitedStatus}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-md active:scale-95 flex items-center space-x-1.5 ${
                isVisited
                  ? 'bg-white text-emerald-800 hover:bg-slate-100'
                  : 'bg-emerald-500 text-white hover:bg-emerald-400'
              }`}
            >
              {isVisited ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Mark as Unvisited</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Mark as Visited</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Highlight & About District */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <div className="flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {district.highlight}
              </p>
            </div>
          </div>

          {/* Visit Details Section (if visited or marking) */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Travel Memories & Details</span>
            </h3>

            {/* Date of Visit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Date of Visit
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={visitedDate}
                  onChange={(e) => setVisitedDate(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() =>
                    setVisitedDate(new Date().toISOString().split('T')[0])
                  }
                  className="px-2.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() - 1);
                    setVisitedDate(d.toISOString().split('T')[0]);
                  }}
                  className="px-2.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                >
                  Yesterday
                </button>
              </div>
            </div>

            {/* Star Rating */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Trip Experience Rating
              </label>
              <div className="flex items-center space-x-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition"
                    title={`${star} Star`}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs text-slate-500 font-semibold ml-2">
                  {rating === 5
                    ? 'Unforgettable!'
                    : rating === 4
                    ? 'Great journey'
                    : rating === 3
                    ? 'Good trip'
                    : 'Average'}
                </span>
              </div>
            </div>

            {/* Notable Spots Checklist */}
            {district.spots && district.spots.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Famous Attractions in {district.name} (Click places you've seen)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {district.spots.map((spot) => {
                    const isChecked = favoriteSpots.includes(spot);
                    return (
                      <button
                        key={spot}
                        type="button"
                        onClick={() => toggleSpot(spot)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition flex items-center space-x-1 ${
                          isChecked
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="w-3 h-3" />}
                        <span>{spot}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Travel Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Trip Notes & Stories (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What did you see? Famous food eaten (e.g. Bogura Doi, Hilsa)? Where did you stay? Memorable moments..."
                rows={3}
                className="w-full p-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-slate-400"
              />
            </div>

            {/* Photo Memories */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Photo Memories ({photos.length})
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Add Photos</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />

              {photos.length === 0 ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-emerald-400 transition bg-slate-50/50"
                >
                  <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-slate-600">
                    Add photos from your visit
                  </p>
                  <p className="text-[11px] text-slate-400">
                    PNG, JPG, WebP stored locally in your browser
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {photos.map((photo, idx) => (
                    <div
                      key={idx}
                      className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
                    >
                      <img
                        src={photo}
                        alt={`Visit memory ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-emerald-400 hover:text-emerald-600 transition"
                  >
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span className="text-[10px] font-bold">+ Add More</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {isVisited && (
            <section className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
              <div className="flex items-start gap-2">
                <Share2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Share this visit</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    Share your district and selected attractions. Your private notes and photos are not included.
                    For Instagram, copy the caption and paste it into your post.
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {typeof navigator.share === 'function' && (
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-800"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Share
                  </button>
                )}
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-green-700"
                >
                  WhatsApp
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl.toString())}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-800"
                >
                  Facebook
                </a>
                <button
                  type="button"
                  onClick={handleCopyShareText}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                >
                  {shareMessage.startsWith('Caption and visit link copied') ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  Copy caption
                </button>
              </div>
              {shareMessage && (
                <p role="status" className="mt-2 text-xs text-slate-600">
                  {shareMessage}
                </p>
              )}
            </section>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            {isVisited && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Remove travel record for ${district.name}?`)) {
                    onRemoveRecord(district.id);
                    onClose();
                  }
                }}
                className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Record</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{saveSuccess ? 'Saved!' : 'Save Memories'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
