import React from 'react';

interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
  ariaLabel?: string;
  className?: string;
}

export const HamburgerButton: React.FC<HamburgerButtonProps> = ({
  isOpen,
  onClick,
  ariaLabel = 'Toggle navigation menu',
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-expanded={isOpen}
      className={`relative inline-flex items-center justify-center w-11 h-11 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800 hover:border-orange-500/50 text-zinc-300 hover:text-orange-400 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:ring-offset-2 focus:ring-offset-zinc-950 ${className}`}
    >
      <div className="w-5 h-4 relative flex flex-col justify-between items-center pointer-events-none">
        {/* Top bar */}
        <span
          className={`h-0.5 w-5 bg-current rounded-full transition-all duration-300 ease-in-out transform origin-center ${
            isOpen ? 'rotate-45 translate-y-[7px] bg-orange-400' : ''
          }`}
        />
        {/* Middle bar */}
        <span
          className={`h-0.5 w-5 bg-current rounded-full transition-all duration-200 ease-in-out ${
            isOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
          }`}
        />
        {/* Bottom bar */}
        <span
          className={`h-0.5 w-5 bg-current rounded-full transition-all duration-300 ease-in-out transform origin-center ${
            isOpen ? '-rotate-45 -translate-y-[7px] bg-orange-400' : ''
          }`}
        />
      </div>
    </button>
  );
};
