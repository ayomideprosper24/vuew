import React from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  color?: 'orange' | 'rose' | 'emerald';
  icon?: React.ReactNode;
  id?: string;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  label,
  description,
  size = 'md',
  color = 'orange',
  icon,
  id,
  className = '',
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(!checked);
    }
  };

  // Dimensions by size
  const trackSizes = {
    sm: 'w-8 h-4.5 p-0.5',
    md: 'w-11 h-6 p-0.5',
    lg: 'w-14 h-7.5 p-1',
  };

  const thumbSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const translations = {
    sm: checked ? 'translate-x-3.5' : 'translate-x-0',
    md: checked ? 'translate-x-5' : 'translate-x-0',
    lg: checked ? 'translate-x-6.5' : 'translate-x-0',
  };

  // Active color styles
  const activeColorStyles = {
    orange: 'bg-orange-500 border-orange-400/90 shadow-[0_0_12px_rgba(249,115,22,0.35)]',
    rose: 'bg-rose-600 border-rose-500/90 shadow-[0_0_12px_rgba(225,29,72,0.35)]',
    emerald: 'bg-emerald-500 border-emerald-400/90 shadow-[0_0_12px_rgba(16,185,129,0.35)]',
  };

  const trackBg = checked
    ? activeColorStyles[color]
    : 'bg-zinc-900/90 border-zinc-700/80 hover:border-zinc-600';

  const switchElement = (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`relative inline-flex items-center flex-shrink-0 cursor-pointer rounded-full border transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:ring-offset-2 focus:ring-offset-zinc-950 ${trackSizes[size]} ${trackBg} ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'
      }`}
    >
      <span
        className={`pointer-events-none inline-block rounded-full bg-white shadow-md transform ring-0 transition-transform duration-200 ease-spring ${thumbSizes[size]} ${translations[size]} flex items-center justify-center`}
      >
        {icon && <span className="text-[10px] text-zinc-900">{icon}</span>}
      </span>
    </button>
  );

  if (!label && !description) {
    return <div className={`inline-flex items-center ${className}`}>{switchElement}</div>;
  }

  return (
    <div
      onClick={handleClick}
      className={`flex items-center justify-between gap-3 cursor-pointer select-none group ${
        disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
      } ${className}`}
    >
      <div className="flex-1 pr-2">
        {label && (
          <span className="block text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
            {label}
          </span>
        )}
        {description && (
          <span className="block text-[11px] text-zinc-400 leading-normal mt-0.5">
            {description}
          </span>
        )}
      </div>
      {switchElement}
    </div>
  );
};
