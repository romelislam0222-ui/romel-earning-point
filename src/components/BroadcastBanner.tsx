import React from 'react';
import { Megaphone } from 'lucide-react';

interface BroadcastBannerProps {
  message?: string;
  isActive?: boolean;
}

export const BroadcastBanner: React.FC<BroadcastBannerProps> = ({ message, isActive = true }) => {
  if (!isActive || !message) return null;

  return (
    <div className="w-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border-y border-amber-500/30 py-2 px-4 shadow-inner backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center gap-3 overflow-hidden">
        <span className="flex items-center gap-1 text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-slate-950 shadow-sm shrink-0">
          <Megaphone className="w-3.5 h-3.5" /> Notice
        </span>
        <div className="overflow-hidden whitespace-nowrap w-full">
          <p className="inline-block text-amber-200 text-xs sm:text-sm font-semibold tracking-wide animate-marquee">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};