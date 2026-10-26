import React, { useState, useRef } from 'react';
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  Trophy,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { TravelStats, DivisionStat, DistrictVisit } from '../types';
import { DISTRICTS } from '../data/districts';

interface PassportShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: TravelStats;
  divisionStats: DivisionStat[];
  visits: Record<string, DistrictVisit>;
}

export const PassportShareModal: React.FC<PassportShareModalProps> = ({
  isOpen,
  onClose,
  stats,
  divisionStats,
  visits,
}) => {
  if (!isOpen) return null;

  const [travelerName, setTravelerName] = useState('Traveler of Bangladesh');
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const visitedDistricts = DISTRICTS.filter((d) => visits[d.id]?.visited);

  const handleCopySummary = () => {
    const text = `🇧🇩 My Green Bangladesh Travel Passport\n` +
      `👤 Traveler: ${travelerName}\n` +
      `🌿 Progress: ${stats.percentage}% Explored (${stats.visited}/64 Districts)\n` +
      `📍 Visited Districts: ${visitedDistricts.map((d) => d.name).slice(0, 10).join(', ')}${visitedDistricts.length > 10 ? ` and ${visitedDistricts.length - 10} more` : ''}\n` +
      `Track your Bangladesh journey on Green Bangladesh!`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = () => {
    setIsExporting(true);

    // Draw passport card on an HTML5 canvas for clean, crisp PNG export
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setIsExporting(false);
      return;
    }

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 1200, 700);
    gradient.addColorStop(0, '#0F172A');
    gradient.addColorStop(1, '#1E293B');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 700);

    // Top green banner
    ctx.fillStyle = '#22C55E';
    ctx.fillRect(0, 0, 1200, 16);

    // Border line
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, 1120, 620);

    // Header Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('GREEN BANGLADESH', 70, 110);

    ctx.fillStyle = '#22C55E';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('OFFICIAL TRAVEL PASSPORT & STATS', 70, 145);

    // Traveler Name
    ctx.fillStyle = '#94A3B8';
    ctx.font = '14px sans-serif';
    ctx.fillText('TRAVELER NAME', 70, 200);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(travelerName, 70, 235);

    // Metric box 1: Visited
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.roundRect(70, 280, 220, 120, 16);
    ctx.fill();
    ctx.strokeStyle = '#22C55E';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#22C55E';
    ctx.font = 'bold 42px sans-serif';
    ctx.fillText(`${stats.visited}`, 95, 345);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '13px sans-serif';
    ctx.fillText('DISTRICTS VISITED / 64', 95, 375);

    // Metric box 2: Explored %
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.roundRect(310, 280, 220, 120, 16);
    ctx.fill();
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 42px sans-serif';
    ctx.fillText(`${stats.percentage}%`, 335, 345);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '13px sans-serif';
    ctx.fillText('BANGLADESH EXPLORED', 335, 375);

    // Metric box 3: Remaining
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.roundRect(550, 280, 220, 120, 16);
    ctx.fill();
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 42px sans-serif';
    ctx.fillText(`${stats.remaining}`, 575, 345);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '13px sans-serif';
    ctx.fillText('DISTRICTS REMAINING', 575, 375);

    // Visited Districts list in columns
    ctx.fillStyle = '#CBD5E1';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`VISITED PLACES (${visitedDistricts.length})`, 70, 440);

    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#94A3B8';
    const names = visitedDistricts.map((d) => d.name);
    let x = 70, y = 475;
    for (let i = 0; i < Math.min(names.length, 24); i++) {
      ctx.fillText(`✓ ${names[i]}`, x, y);
      y += 26;
      if (y > 600) {
        y = 475;
        x += 180;
      }
    }
    if (names.length > 24) {
      ctx.fillText(`+ ${names.length - 24} more districts`, x, y);
    }
    if (names.length === 0) {
      ctx.fillText('No districts visited yet. Start turning Bangladesh green!', x, y);
    }

    // Right seal badge
    ctx.beginPath();
    ctx.arc(980, 200, 75, 0, 2 * Math.PI);
    ctx.fillStyle = '#15803D';
    ctx.fill();
    ctx.strokeStyle = '#22C55E';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GREEN BD', 980, 195);
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('VERIFIED MAP', 980, 220);
    ctx.textAlign = 'left';

    // Footer timestamp
    ctx.fillStyle = '#64748B';
    ctx.font = '12px sans-serif';
    ctx.fillText(
      `Generated on ${new Date().toLocaleDateString()} • Green Bangladesh My Travel Map`,
      70,
      630
    );

    // Download PNG
    const link = document.createElement('a');
    link.download = `green-bangladesh-passport-${travelerName.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setIsExporting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
              <Trophy className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Green Bangladesh Passport
              </h3>
              <p className="text-xs text-slate-500">
                Your travel certificate and shareable map card
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

        {/* Name input */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Traveler Name
          </label>
          <input
            type="text"
            value={travelerName}
            onChange={(e) => setTravelerName(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            placeholder="Your Name"
          />
        </div>

        {/* Preview Passport Card */}
        <div
          ref={cardRef}
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 border border-slate-700 shadow-xl mb-5 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500"></div>

          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">
                Official Travel Record
              </span>
              <h4 className="text-xl font-black">{travelerName}</h4>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-600/30 border border-emerald-400 flex flex-col items-center justify-center text-center">
              <span className="text-[9px] font-bold text-emerald-300">GREEN</span>
              <span className="text-xs font-black text-white">BD</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 mb-4">
            <div className="bg-white/10 rounded-xl p-2.5 text-center backdrop-blur-sm border border-white/10">
              <p className="text-[10px] text-slate-300 uppercase font-semibold">Visited</p>
              <p className="text-xl font-black text-emerald-400">{stats.visited} / 64</p>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5 text-center backdrop-blur-sm border border-white/10">
              <p className="text-[10px] text-slate-300 uppercase font-semibold">Explored</p>
              <p className="text-xl font-black text-sky-400">{stats.percentage}%</p>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5 text-center backdrop-blur-sm border border-white/10">
              <p className="text-[10px] text-slate-300 uppercase font-semibold">Remaining</p>
              <p className="text-xl font-black text-slate-300">{stats.remaining}</p>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Visited Districts ({visitedDistricts.length})
            </p>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
              {visitedDistricts.length === 0 ? (
                <span className="text-xs text-slate-400 italic">
                  No districts marked green yet. Click any district on the map to start!
                </span>
              ) : (
                visitedDistricts.map((d) => (
                  <span
                    key={d.id}
                    className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded"
                  >
                    {d.name}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleCopySummary}
            className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center space-x-1.5"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Summary Text</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadImage}
            disabled={isExporting}
            className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1.5 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG Card</span>
          </button>
        </div>
      </div>
    </div>
  );
};
