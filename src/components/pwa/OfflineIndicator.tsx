import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { offlineQueue, QueuedAction } from '../../services/offlineQueue';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, wasOffline } = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(offlineQueue.getPendingCount());
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    const unsubscribe = offlineQueue.subscribe((queue) => {
      setPendingCount(queue.length);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isOnline && wasOffline) {
      setJustReconnected(true);
      const timer = setTimeout(() => setJustReconnected(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  return (
    <>
      {/* Top Navbar Connection Pill */}
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-medium select-none">
        {isOnline ? (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            <span className="text-slate-400 font-mono text-[10px]">Connected</span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-400 font-mono text-[10px] font-bold">Offline</span>
            {pendingCount > 0 && (
              <span className="px-1 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 font-mono">
                {pendingCount} queued
              </span>
            )}
          </>
        )}
      </div>

      {/* Floating Offline Toast Notification when network drops */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-amber-950/95 border border-amber-500/40 text-amber-200 shadow-2xl backdrop-blur-md text-xs">
            <WifiOff className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
            <div>
              <span className="font-bold text-white block">You are offline</span>
              <span className="text-[11px] text-amber-300/80 block">
                Cached shell active. Network actions will queue and synchronize when reconnected.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Reconnection Toast when coming back online */}
      {justReconnected && (
        <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-emerald-950/95 border border-emerald-500/40 text-emerald-200 shadow-2xl backdrop-blur-md text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div>
              <span className="font-bold text-white">Back Online</span>
              <span className="text-[11px] text-emerald-300/80 ml-1.5">
                Workspace synchronized with server.
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
