import React, { useState, useEffect } from 'react';

export const PWASplash: React.FC = () => {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Quick, polished startup pulse (450ms then 250ms smooth fade)
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 400);

    const removeTimer = setTimeout(() => {
      setVisible(false);
    }, 650);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 select-none transition-opacity duration-300 pointer-events-none ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Glowing Brand Emblem */}
        <div className="relative">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-[0_0_40px_rgba(59,130,246,0.5)]">
            V
          </div>
          <div className="absolute -inset-1 rounded-3xl bg-blue-500/20 blur-sm -z-10 animate-pulse" />
        </div>

        <div>
          <h1 className="text-xl font-black text-white tracking-widest font-mono">VUEW</h1>
          <p className="text-[11px] text-slate-400 font-medium tracking-wide mt-1">
            Team Accountability &amp; Execution Platform
          </p>
        </div>

        {/* Minimalist Loading Bar */}
        <div className="w-28 h-1 bg-slate-900 rounded-full overflow-hidden mt-3 border border-slate-800">
          <div className="h-full bg-blue-500 rounded-full w-full animate-[shimmer_1s_infinite] bg-gradient-to-r from-blue-600 via-indigo-400 to-blue-600" />
        </div>
      </div>
    </div>
  );
};
