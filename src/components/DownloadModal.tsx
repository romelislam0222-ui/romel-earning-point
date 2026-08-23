import React from 'react';
import { X, Download, ShieldCheck, FileArchive } from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-purple-500/30 shadow-2xl p-6 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <FileArchive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Download Source ZIP</h3>
              <p className="text-xs text-slate-400">Complete Full-Stack Application</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3 text-xs text-slate-300">
          <p className="leading-relaxed">
            You can download the entire application source code bundle including frontend components, Express backend with WebSocket server, data models, and configurations.
          </p>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="font-semibold">Ready to deploy & run locally</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Simply run <code className="text-purple-300 font-mono">npm install</code> followed by <code className="text-purple-300 font-mono">npm run dev</code>.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </button>
          <a
            href="/api/download-zip"
            download="romel-earning-point-source.zip"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-950/60"
          >
            <Download className="w-4 h-4" /> Download ZIP
          </a>
        </div>
      </div>
    </div>
  );
};