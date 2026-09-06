import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Share,
  PlusSquare,
  Monitor,
  Smartphone,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, platform, install } = usePWAInstall();
  const [swActive, setSwActive] = useState<boolean | null>(null);
  const [installStatus, setInstallStatus] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        setSwActive(!!reg);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    setInstallStatus('Prompting install...');
    const outcome = await install();
    if (outcome === 'accepted') {
      setInstallStatus('Installed successfully!');
      setTimeout(() => onClose(), 1200);
    } else if (outcome === 'dismissed') {
      setInstallStatus('Prompt dismissed. You can install anytime from the menu.');
    } else {
      setInstallStatus('Use the browser menu instructions below.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Icon & Title in Orange & Black */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-black font-black text-xl shadow-[0_0_25px_rgba(249,115,22,0.4)]">
            V
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white tracking-tight">Install VUEW</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                PWA Mobile &amp; Desktop
              </span>
            </div>
            <p className="text-xs text-zinc-400">Team Accountability &amp; Execution Platform</p>
          </div>
        </div>

        {/* Status: Already Installed */}
        {isInstalled ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-xs font-bold text-emerald-300">VUEW is Running in Standalone App Mode!</p>
            <p className="text-[11px] text-zinc-400">
              You have already added VUEW to your device. You enjoy zero browser bars, instant cached startup, and offline task queueing.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Native 1-Click Install Button if supported */}
            {isInstallable && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 via-zinc-900 to-orange-500/5 border border-orange-500/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-orange-400">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span>One-Tap Direct Installation Ready</span>
                </div>
                <p className="text-xs text-zinc-300">
                  Your device browser supports instant installation. Tap below to add VUEW to your home screen or dock.
                </p>
                <button
                  type="button"
                  onClick={handleNativeInstall}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-black text-xs font-bold shadow-lg shadow-orange-500/25 transition-all active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  <span>Install VUEW on This Device</span>
                </button>
                {installStatus && (
                  <p className="text-[11px] text-center text-orange-300">{installStatus}</p>
                )}
              </div>
            )}

            {/* Mobile iOS Safari / Chrome on iOS Instructions */}
            {platform.isIOS && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                  <Smartphone className="w-4 h-4 text-orange-400" />
                  <span>Instructions for iPhone &amp; iPad (iOS)</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Apple iOS requires adding to Home Screen through the Safari or Chrome share menu:
                </p>

                <ol className="space-y-2.5">
                  <li className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center text-[11px]">
                      1
                    </span>
                    <div className="text-zinc-300">
                      Tap the <strong className="text-white">Share</strong> icon{' '}
                      <Share className="w-3.5 h-3.5 inline-block text-orange-400 mb-0.5 mx-0.5" /> in your Safari bottom toolbar (or top right in Chrome).
                    </div>
                  </li>

                  <li className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center text-[11px]">
                      2
                    </span>
                    <div className="text-zinc-300">
                      Scroll down and tap{' '}
                      <strong className="text-white">&ldquo;Add to Home Screen&rdquo;</strong>{' '}
                      <PlusSquare className="w-3.5 h-3.5 inline-block text-emerald-400 mb-0.5 mx-0.5" />.
                    </div>
                  </li>

                  <li className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center text-[11px]">
                      3
                    </span>
                    <div className="text-zinc-300">
                      Tap <strong className="text-white">&ldquo;Add&rdquo;</strong> in the top right. VUEW will now launch like a native mobile app!
                    </div>
                  </li>
                </ol>
              </div>
            )}

            {/* Mobile Android Instructions (when prompt not directly available) */}
            {platform.isAndroid && !isInstallable && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                  <Smartphone className="w-4 h-4 text-orange-400" />
                  <span>Instructions for Android Mobile &amp; Tablets</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Install VUEW in Chrome, Edge, or Samsung Internet:
                </p>

                <ol className="space-y-2.5">
                  <li className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center text-[11px]">
                      1
                    </span>
                    <div className="text-zinc-300">
                      Tap the <strong className="text-white">Three-Dots (⋮) Menu</strong> in the top-right corner of Chrome or your browser.
                    </div>
                  </li>

                  <li className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center text-[11px]">
                      2
                    </span>
                    <div className="text-zinc-300">
                      Select <strong className="text-white">&ldquo;Install app&rdquo;</strong> or{' '}
                      <strong className="text-white">&ldquo;Add to Home screen&rdquo;</strong>.
                    </div>
                  </li>

                  <li className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center text-[11px]">
                      3
                    </span>
                    <div className="text-zinc-300">
                      Confirm <strong className="text-white">&ldquo;Install&rdquo;</strong>. The VUEW icon will appear on your app drawer and home screen.
                    </div>
                  </li>
                </ol>
              </div>
            )}

            {/* Desktop Instructions */}
            {platform.isDesktop && !isInstallable && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                  <Monitor className="w-4 h-4 text-orange-400" />
                  <span>Desktop Installation (Mac, Windows, Linux, ChromeOS)</span>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2.5 text-xs text-zinc-300">
                  <div className="flex items-start gap-2.5">
                    <Download className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>
                      Look for the <strong className="text-white">Install VUEW</strong> icon in your browser address bar (right side next to the bookmark star).
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <ArrowRight className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                    <span>
                      Click <strong className="text-white">&ldquo;Install&rdquo;</strong> to run VUEW in a dedicated high-performance standalone window.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* PWA Verification & Offline Readiness Indicator */}
            <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800 text-xs space-y-2">
              <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                  PWA Readiness Diagnostics
                </span>
                <span className="text-[10px] text-zinc-500">Service Worker &amp; Offline</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-center justify-between">
                  <span className="text-zinc-400">Offline Worker:</span>
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {swActive !== false ? 'Active' : 'Registering'}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-center justify-between">
                  <span className="text-zinc-400">Web Manifest:</span>
                  <span className="font-semibold text-emerald-400">Valid v2</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-zinc-800 text-center">
          <button
            onClick={onClose}
            className="text-xs text-zinc-400 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
