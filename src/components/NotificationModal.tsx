import React from 'react';
import { X, Bell, CheckCircle, AlertTriangle, Gift } from 'lucide-react';
import type { NotificationItem } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  currentUserId?: number | null;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  currentUserId
}) => {
  if (!isOpen) return null;

  const userNotifs = notifications.filter(
    n => n.targetUserId === 'all' || n.targetUserId === currentUserId
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 overflow-hidden max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Live Notifications</h3>
              <p className="text-xs text-slate-400">Instant updates & activity alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-3 py-4 flex-1">
          {userNotifs.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              No notifications at the moment.
            </div>
          ) : (
            userNotifs.map((n) => (
              <div
                key={n.id}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex gap-3 items-start"
              >
                <div className="p-2 rounded-lg bg-slate-800 text-amber-400 shrink-0">
                  {n.type === 'reward' ? (
                    <Gift className="w-4 h-4 text-emerald-400" />
                  ) : n.type === 'urgent' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-slate-200">{n.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{n.body}</p>
                  <span className="text-[10px] text-slate-500 mt-2 block">{n.date}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};