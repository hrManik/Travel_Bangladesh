import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Upload,
  FileJson,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { TravelStats, DistrictVisit } from '../types';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: TravelStats;
  onExport: () => void;
  onImport: (jsonString: string) => { success: boolean; count?: number; error?: string };
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  stats,
  onExport,
  onImport,
}) => {
  if (!isOpen) return null;

  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);
  const [pasteContent, setPasteContent] = useState('');
  const [showPasteBox, setShowPasteBox] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = onImport(content);
      if (res.success) {
        setImportStatus({
          type: 'success',
          msg: `Successfully imported ${res.count || 0} visited districts!`,
        });
      } else {
        setImportStatus({
          type: 'error',
          msg: res.error || 'Failed to import JSON file.',
        });
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const handleImportPasted = () => {
    if (!pasteContent.trim()) return;
    const res = onImport(pasteContent);
    if (res.success) {
      setImportStatus({
        type: 'success',
        msg: `Successfully imported ${res.count || 0} visited districts!`,
      });
      setPasteContent('');
    } else {
      setImportStatus({
        type: 'error',
        msg: res.error || 'Failed to parse JSON text.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <FileJson className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Backup & Restore Data
              </h3>
              <p className="text-xs text-slate-500">
                Export or import your Green Bangladesh travel records as JSON
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

        {importStatus && (
          <div
            className={`p-3.5 rounded-xl border text-xs mb-4 flex items-start space-x-2 ${
              importStatus.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {importStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <span>{importStatus.msg}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Export Section */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <h4 className="text-sm font-bold text-slate-800 mb-1 flex items-center space-x-1.5">
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Export Travel Records</span>
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Download your visits, visit dates, notes, and favorite spots as a portable .json file.
            </p>
            <button
              onClick={onExport}
              className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm rounded-xl border border-slate-200 shadow-sm transition flex items-center justify-center space-x-1.5"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Download JSON Backup ({stats.visited} Districts Visited)</span>
            </button>
          </div>

          {/* Import Section */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <h4 className="text-sm font-bold text-slate-800 mb-1 flex items-center space-x-1.5">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Restore from Backup</span>
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Restore your travel map from a previously exported Green Bangladesh JSON file.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="flex items-center space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center space-x-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>Upload JSON File</span>
              </button>

              <button
                onClick={() => setShowPasteBox(!showPasteBox)}
                className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition"
              >
                {showPasteBox ? 'Hide Paste Box' : 'Paste JSON'}
              </button>
            </div>

            {showPasteBox && (
              <div className="mt-3 space-y-2">
                <textarea
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  placeholder="Paste raw JSON here..."
                  rows={4}
                  className="w-full p-2.5 text-xs font-mono bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <button
                  onClick={handleImportPasted}
                  disabled={!pasteContent.trim()}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition disabled:opacity-50"
                >
                  Apply Pasted Data
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
