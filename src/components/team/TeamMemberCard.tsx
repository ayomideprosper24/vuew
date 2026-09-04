import React from 'react';
import { CheckCircle2, Clock, AlertCircle, Shield, Briefcase, Activity, KeyRound } from 'lucide-react';
import { User, Task } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { formatRelativeTime } from '../../utils/helpers';

interface TeamMemberCardProps {
  member: User;
  onSelect: () => void;
  onManagePin?: () => void;
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, onSelect, onManagePin }) => {
  const { tasks, departments, taskUpdates } = useData();
  const { currentUser } = useAuth();

  const userTasks = tasks.filter((t) => t.assigneeId === member.id);
  const activeTasks = userTasks.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
  const completedTasks = userTasks.filter((t) => t.status === 'COMPLETED');
  const blockedTasks = userTasks.filter((t) => t.status === 'BLOCKED');
  const overdueTasks = userTasks.filter((t) => {
    if (t.status === 'COMPLETED' || t.status === 'CANCELLED') return false;
    return new Date(t.dueDate).getTime() < new Date('2026-09-04T14:39:36Z').getTime();
  });

  // Calculate average progress of active tasks
  const avgProgress =
    activeTasks.length > 0
      ? Math.round(activeTasks.reduce((acc, t) => acc + t.progress, 0) / activeTasks.length)
      : completedTasks.length > 0
      ? 100
      : 0;

  // Workload category
  const workload =
    activeTasks.length >= 4
      ? { label: 'Heavy Workload', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' }
      : activeTasks.length >= 2
      ? { label: 'Optimal Workload', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' }
      : { label: 'Light Workload', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };

  // Last update timestamp
  const userUpdates = taskUpdates.filter((u) => u.userId === member.id);
  const lastUpdateDate = userUpdates[0]?.createdAt || member.lastActive;

  const department = departments.find((d) => d.id === member.departmentId);

  return (
    <div
      onClick={onSelect}
      className="group rounded-2xl bg-slate-900/80 border border-slate-800 p-5 hover:border-slate-700 hover:bg-slate-900 transition-all duration-200 cursor-pointer shadow-sm flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Avatar name={member.name} avatar={member.avatar} size="lg" showOnlineStatus />
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                {member.name}
              </h3>
              <p className="text-xs text-slate-400">{member.jobTitle}</p>
              {department && (
                <span className="text-[10px] text-slate-500 font-medium">
                  {department.name}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <Badge variant="role" role={member.role} size="sm" />
            {currentUser.role === 'ADMIN' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onManagePin?.();
                }}
                className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/90 text-blue-300 hover:text-white hover:bg-blue-600/30 border border-slate-700/80 transition-colors"
                title="Click to change member PIN"
              >
                <KeyRound className="w-2.5 h-2.5 text-blue-400" />
                <span>PIN: {member.pin}</span>
              </button>
            )}
          </div>
        </div>

        {/* Workload Pill */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Execution Cadence
          </span>
          <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${workload.color}`}>
            {workload.label}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-mono">
            <span>Avg Active Progress</span>
            <span className="text-white font-bold">{avgProgress}%</span>
          </div>
          <ProgressBar progress={avgProgress} height="sm" />
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-4 gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center mb-4">
          <div>
            <span className="block text-sm font-mono font-bold text-blue-400">{activeTasks.length}</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Active</span>
          </div>
          <div>
            <span className="block text-sm font-mono font-bold text-emerald-400">{completedTasks.length}</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Done</span>
          </div>
          <div>
            <span className={`block text-sm font-mono font-bold ${blockedTasks.length > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {blockedTasks.length}
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Blocked</span>
          </div>
          <div>
            <span className={`block text-sm font-mono font-bold ${overdueTasks.length > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {overdueTasks.length}
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Overdue</span>
          </div>
        </div>
      </div>

      {/* Footer: Last Update */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          <span>Last active update:</span>
        </span>
        <span className="font-mono text-slate-300">{formatRelativeTime(lastUpdateDate)}</span>
      </div>
    </div>
  );
};
