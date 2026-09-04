import React from 'react';
import { Priority, TaskStatus, HealthStatus, Role } from '../../types';
import { getPriorityColor, getStatusColor, getHealthDetails } from '../../utils/helpers';

interface BadgeProps {
  id?: string;
  variant?: 'priority' | 'status' | 'health' | 'role' | 'default';
  priority?: Priority;
  status?: TaskStatus;
  health?: HealthStatus;
  role?: Role;
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  id,
  variant = 'default',
  priority,
  status,
  health,
  role,
  label,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  if (variant === 'priority' && priority) {
    const config = getPriorityColor(priority);
    return (
      <span
        id={id}
        className={`inline-flex items-center gap-1.5 font-medium rounded-md border whitespace-nowrap ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {priority}
      </span>
    );
  }

  if (variant === 'status' && status) {
    const config = getStatusColor(status);
    return (
      <span
        id={id}
        className={`inline-flex items-center gap-1 font-medium rounded-md border whitespace-nowrap ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
      >
        {config.label}
      </span>
    );
  }

  if (variant === 'health' && health) {
    const config = getHealthDetails(health);
    return (
      <span
        id={id}
        className={`inline-flex items-center gap-1.5 font-medium rounded-md border whitespace-nowrap ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
      >
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
        {config.label}
      </span>
    );
  }

  if (variant === 'role' && role) {
    const roleColors: Record<Role, { bg: string; text: string; border: string }> = {
      ADMIN: { bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/30' },
      TEAM_MEMBER: { bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/30' },
    };
    const c = roleColors[role] || roleColors.TEAM_MEMBER;
    return (
      <span
        id={id}
        className={`inline-flex items-center font-medium rounded-md border whitespace-nowrap ${c.bg} ${c.text} ${c.border} ${sizeClasses} ${className}`}
      >
        {role.replace('_', ' ')}
      </span>
    );
  }

  return (
    <span
      id={id}
      className={`inline-flex items-center font-medium rounded-md border border-slate-700/60 bg-slate-800/60 text-slate-300 whitespace-nowrap ${sizeClasses} ${className}`}
    >
      {label}
    </span>
  );
};
