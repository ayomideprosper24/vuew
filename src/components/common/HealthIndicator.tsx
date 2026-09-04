import React from 'react';
import { HealthStatus } from '../../types';
import { getHealthDetails } from '../../utils/helpers';

interface HealthIndicatorProps {
  health: HealthStatus;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const HealthIndicator: React.FC<HealthIndicatorProps> = ({
  health,
  showText = true,
  size = 'md',
  className = '',
}) => {
  const details = getHealthDetails(health);

  const dotSize = size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5';
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm font-semibold' : 'text-xs font-medium';

  return (
    <div className={`inline-flex items-center gap-2 ${className}`} title={`Project/Task Health: ${details.label}`}>
      <span className="relative flex items-center justify-center">
        {health === 'AT_RISK' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-60" />
        )}
        <span
          className={`rounded-full ${dotSize} flex-shrink-0`}
          style={{ backgroundColor: details.color }}
        />
      </span>
      {showText && <span className={`${details.text} ${textSize}`}>{details.label}</span>}
    </div>
  );
};
