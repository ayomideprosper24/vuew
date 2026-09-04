import React from 'react';
import { HealthStatus, TaskStatus } from '../../types';

interface ProgressBarProps {
  id?: string;
  progress: number; // 0 - 100
  height?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  health?: HealthStatus;
  status?: TaskStatus;
  animate?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  id,
  progress,
  height = 'md',
  showLabel = false,
  health,
  status,
  className = '',
}) => {
  const clamped = Math.min(100, Math.max(0, progress));

  const heightMap = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
    xl: 'h-6',
  };

  // Determine bar fill color based on status and health
  let fillColor = 'bg-blue-500';
  if (status === 'COMPLETED') {
    fillColor = 'bg-emerald-500';
  } else if (status === 'BLOCKED' || health === 'AT_RISK') {
    fillColor = 'bg-rose-500';
  } else if (status === 'IN_REVIEW') {
    fillColor = 'bg-purple-500';
  } else if (health === 'NEEDS_ATTENTION') {
    fillColor = 'bg-amber-500';
  } else if (clamped > 80) {
    fillColor = 'bg-emerald-500';
  }

  return (
    <div id={id} className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
          <span>Progress</span>
          <span className="font-mono text-slate-200">{clamped}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/40 p-0.5 ${heightMap[height]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${fillColor} ${
            status === 'IN_PROGRESS' ? 'shadow-[0_0_12px_rgba(59,130,246,0.3)]' : ''
          }`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
