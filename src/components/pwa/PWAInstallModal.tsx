import React from 'react';
import { X, Download, Share, PlusSquare, Monitor, Smartphone, CheckCircle, ArrowRight } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, platform, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    const outcome = await install();
    if (outcome === 'accepted') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Icon & Title */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-[0_0_25px_rgba(59,130,246,0.4)]">
            V
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Install VUEW</h3>
            <p className="text-xs text-slate-400">Team Accountability &amp; Execution Platform</p>
          </div>
        </div>

        {isInstalled ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-xs font-semibold text-emerald-300">VUEW is already installed on your device!</p>
            <p className="text-[11px] text-slate-400">
              You are running the standalone Progressive Web App with offline support and instantaneous startup.
            </p>
          </div>
        ) : isInstallable ? (
          /* Native Chromium / Android prompt available */
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Install VUEW directly to your home screen or application launcher for faster access, dedicated window mode, and offline resilience.
            </p>
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                <span>Zero browser address bars or navigation tabs</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                <span>Instant loading from local device cache</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                <span>Protected PIN authentication state preserved</span>
              </div>
            </div>

            <button
              onClick={handleNativeInstall}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              <span>Install VUEW Now</span>
            </button>
          </div>
        ) : platform.isIOS ? (
          /* iOS Safari Guided Steps */
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              To install VUEW on your iPhone or iPad via Safari:
            </p>

            <ol className="space-y-3">
              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-[11px]">
                  1
                </span>
                <div className="text-slate-300">
                  Tap the <strong className="text-white">Share</strong> button{' '}
                  <Share className="w-3.5 h-3.5 inline-block text-blue-400 mb-0.5 mx-0.5" /> in your Safari bottom toolbar.
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-[11px]">
                  2
                </span>
                <div className="text-slate-300">
                  Scroll down the share menu and tap{' '}
                  <strong className="text-white">&ldquo;Add to Home Screen&rdquo;</strong>{' '}
                  <PlusSquare className="w-3.5 h-3.5 inline-block text-emerald-400 mb-0.5 mx-0.5" />.
                </div>
              </li>

              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-[11px]">
                  3
                </span>
                <div className="text-slate-300">
                  Tap <strong className="text-white">&ldquo;Add&rdquo;</strong> in the top right corner. VUEW will appear on your home screen!
                </div>
              </li>
            </ol>
          </div>
        ) : (
          /* Desktop Browser Guidance (Chrome, Edge, or others) */
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Install VUEW on your desktop computer for seamless team task management and offline access:
            </p>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <Monitor className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>
                  Look for the <strong className="text-white">Install</strong> icon in your browser address bar (usually on the right side next to the bookmark star).
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <ArrowRight className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>
                  Click <strong className="text-white">&ldquo;Install VUEW&rdquo;</strong> to add VUEW as a desktop app in Windows, macOS, or ChromeOS.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
