import React from 'react';
import { X, MapPin, Heart, Compass, CheckCircle2, ShieldCheck, Globe } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Green Bangladesh
              </h3>
              <p className="text-xs font-bangla text-emerald-700 font-semibold">
                আমার ভ্রমণ মানচিত্র • My Travel Map
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

        <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p>
            <strong>Green Bangladesh</strong> is an interactive travel visualization platform designed to help travelers, wanderers, and citizens track their journey across all <strong>64 administrative districts</strong> of Bangladesh.
          </p>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>How it works:</span>
            </h4>
            <ul className="space-y-1.5 pl-5 list-disc text-slate-600">
              <li>Initially, the entire map is crisp white with subtle boundaries.</li>
              <li>When you visit a district, mark it as visited to turn it lush green (<span className="text-emerald-600 font-bold">#22C55E</span>).</li>
              <li>Record the date of your visit, trip notes, favorite spots, and upload photo memories.</li>
              <li>Your progress is calculated automatically: <code>Percentage = (Visited / 64) × 100</code>.</li>
              <li>Export your Travel Passport certificate card to share on social media!</li>
            </ul>
          </div>

          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200/80 space-y-1.5">
            <h4 className="font-bold text-emerald-900 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Geographic Accuracy & Privacy</span>
            </h4>
            <p className="text-emerald-800 text-xs">
              District boundaries are rendered from authoritative administrative geographic data. All your notes, photos, and visited records are saved securely inside your browser's local storage. No account or remote database is required.
            </p>
          </div>

          <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-100">
            Dedicated to promoting travel, eco-tourism, and cultural appreciation across Bangladesh 🇧🇩
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
