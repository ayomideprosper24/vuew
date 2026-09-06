import React, { useState } from 'react';
import { Download, X, Sparkles, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

export const PWAInstallBanner: React.FC = () => {
  const { isInstalled, isBannerDismissed, install, isInstallable, dismissBanner } = usePWAInstall();
  const [modalOpen, setModalOpen] = useState(false);

  // Suppress banner if already running in standalone/installed mode or previously dismissed
  if (isInstalled || isBannerDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'manual_instructions') {
        setModalOpen(true);
      }
    } else {
      setModalOpen(true);
    }
  };

  return (
    <>
      <div className="mx-4 sm:mx-6 lg:mx-8 mb-4">
        <div className="relative rounded-2xl bg-gradient-to-r from-orange-950/40 via-zinc-950 to-zinc-900 border border-orange-500/30 p-3.5 sm:p-4 shadow-xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-black font-black text-base shadow-[0_0_15px_rgba(249,115,22,0.35)] flex-shrink-0">
              V
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">Install VUEW App</h4>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  <Sparkles className="w-2.5 h-2.5" /> Mobile &amp; Desktop PWA
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-0.5">
                Fast standalone launch, offline caching, and instant blocker updates.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-black text-xs font-bold shadow-md shadow-orange-500/20 transition-all active:scale-[0.98] whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install VUEW</span>
            </button>

            <button
              type="button"
              onClick={dismissBanner}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              aria-label="Dismiss banner"
              title="Don't show again"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <PWAInstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
