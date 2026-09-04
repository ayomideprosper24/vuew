import React from 'react';
import {
  ListTodo,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  AlertCircle,
  TrendingUp,
  Activity,
  ArrowRight,
  Shield,
  Plus,
  Zap,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ProgressBar } from '../components/common/ProgressBar';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';
import { HealthIndicator } from '../components/common/HealthIndicator';
import { TaskCard } from '../components/tasks/TaskCard';
import { formatRelativeTime } from '../utils/helpers';

interface DashboardPageProps {
  onNavigateToTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateToTab }) => {
  const { tasks, projects, activityLogs, setSelectedTaskId, setCreateTaskModalOpen } = useData();
  const { allUsers, currentUser, canCreateTask } = useAuth();

  // Reference timestamp: 2026-09-04
  const now = new Date('2026-09-04T14:39:36Z').getTime();

  // Metrics
  const activeTasks = tasks.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');
  const atRiskTasks = tasks.filter(
    (t) => t.health === 'AT_RISK' && t.status !== 'COMPLETED' && t.status !== 'CANCELLED'
  );
  const overdueTasks = tasks.filter((t) => {
    if (t.status === 'COMPLETED' || t.status === 'CANCELLED') return false;
    return new Date(t.dueDate).getTime() < now;
  });

  const dueTodayTasks = tasks.filter((t) => {
    if (t.status === 'COMPLETED' || t.status === 'CANCELLED') return false;
    return t.dueDate === '2026-09-04';
  });

  const dueThisWeekTasks = tasks.filter((t) => {
    if (t.status === 'COMPLETED' || t.status === 'CANCELLED') return false;
    const diff = (new Date(t.dueDate).getTime() - now) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  });

  const blockedTasks = tasks.filter((t) => t.status === 'BLOCKED');

  // Overall Team Progress %
  const totalTasks = tasks.length;
  const overallProgress =
    totalTasks > 0 ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / totalTasks) : 0;

  // Individual Team Progress calculation
  const teamProgressList = allUsers
    .map((member) => {
      const userTasks = tasks.filter((t) => t.assigneeId === member.id);
      const userActive = userTasks.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
      const avg =
        userTasks.length > 0
          ? Math.round(userTasks.reduce((sum, t) => sum + t.progress, 0) / userTasks.length)
          : 0;

      const hasBlocked = userTasks.some((t) => t.status === 'BLOCKED');
      const hasAtRisk = userTasks.some((t) => t.health === 'AT_RISK');

      let statusLabel = 'On Track';
      let statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      if (hasBlocked || avg < 30) {
        statusLabel = 'At Risk';
        statusColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      } else if (hasAtRisk || avg < 60) {
        statusLabel = 'Needs Attention';
        statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      }

      return {
        member,
        progress: avg,
        activeCount: userActive.length,
        statusLabel,
        statusColor,
      };
    });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Philosophy Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-950 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">
              EXECUTIVE COCKPIT
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">September 4, 2026</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Team Accountability Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            &ldquo;Everyone should always know what they are responsible for, what is being worked on,
            how far it has gone, what is blocking it, and when it is expected to be completed.&rdquo;
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {canCreateTask && (
            <button
              onClick={() => setCreateTaskModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          )}
          <button
            onClick={() => onNavigateToTab('my-work')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <span>My Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Core Primary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ACTIVE TASKS */}
        <div
          onClick={() => onNavigateToTab('tasks')}
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              ACTIVE TASKS
            </span>
            <ListTodo className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-white">{activeTasks.length}</span>
            <span className="text-xs text-slate-500 font-mono">in progress</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            <span>{dueTodayTasks.length} due today</span>
            <span className="text-blue-400">{dueThisWeekTasks.length} this week</span>
          </div>
        </div>

        {/* COMPLETED */}
        <div
          onClick={() => onNavigateToTab('tasks')}
          className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              COMPLETED
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-emerald-400">
              {completedTasks.length}
            </span>
            <span className="text-xs text-slate-500 font-mono">signed off</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            <span>Overall Execution</span>
            <span className="text-emerald-400 font-mono font-bold">{overallProgress}%</span>
          </div>
        </div>

        {/* AT RISK */}
        <div
          onClick={() => onNavigateToTab('tasks')}
          className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 hover:border-amber-500/60 bg-amber-950/5 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              AT RISK
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-amber-400">
              {atRiskTasks.length}
            </span>
            <span className="text-xs text-amber-500/80 font-mono">needs push</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-amber-400/80 pt-2 border-t border-amber-500/20">
            <span>Critical deadlines</span>
            <span>Immediate review</span>
          </div>
        </div>

        {/* OVERDUE */}
        <div
          onClick={() => onNavigateToTab('tasks')}
          className="p-4 rounded-2xl bg-slate-900/80 border border-rose-500/30 hover:border-rose-500/60 bg-rose-950/5 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
              OVERDUE
            </span>
            <Clock className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-rose-400">
              {overdueTasks.length}
            </span>
            <span className="text-xs text-rose-500/80 font-mono">past target</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-rose-400/80 pt-2 border-t border-rose-500/20">
            <span>Blocked: {blockedTasks.length}</span>
            <span>Zero tolerance</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Left 2 Cols (Team Progress & At-Risk Radar) + Right 1 Col (Activity & Blockers) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Team Progress & Projects */}
        <div className="lg:col-span-2 space-y-6">
          {/* TEAM PROGRESS */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  TEAM PROGRESS &amp; EXECUTION STATUS
                </h3>
                <p className="text-xs text-slate-400">
                  Individual completion rate, current trajectory, and health indicator
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab('team')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
              >
                <span>View Team</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-4 divide-y divide-slate-800/70">
              {teamProgressList.map(({ member, progress, activeCount, statusLabel, statusColor }) => (
                <div key={member.id} className="pt-3.5 first:pt-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Avatar name={member.name} avatar={member.avatar} size="sm" showOnlineStatus />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-200">{member.name}</span>
                          <span className="text-xs text-slate-400 hidden sm:inline">
                            • {member.jobTitle}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {activeCount} active {activeCount === 1 ? 'task' : 'tasks'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-white">{progress}%</span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusColor}`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                  </div>

                  <ProgressBar progress={progress} height="sm" />
                </div>
              ))}
            </div>
          </div>

          {/* CRITICAL ATTENTION RADAR: Blocked & At-Risk Tasks */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  ATTENTION RADAR: BLOCKED &amp; AT RISK
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {blockedTasks.length + atRiskTasks.length} tasks flagged
              </span>
            </div>

            {blockedTasks.length === 0 && atRiskTasks.length === 0 ? (
              <div className="p-8 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                All deliverables are progressing on track with zero active blockers.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Blocked tasks first */}
                {blockedTasks.map((t) => (
                  <TaskCard key={t.id} task={t} />
                ))}
                {/* Other at-risk tasks */}
                {atRiskTasks
                  .filter((t) => t.status !== 'BLOCKED')
                  .slice(0, 2)
                  .map((t) => (
                    <TaskCard key={t.id} task={t} />
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Accountability Activity Stream */}
        <div className="space-y-6">
          {/* SYSTEM ACTIVITY STREAM */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  REAL-TIME LOGS
                </h3>
              </div>
              <button
                onClick={() => onNavigateToTab('activity')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                View all
              </button>
            </div>

            <div className="space-y-3.5">
              {activityLogs.slice(0, 7).map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-xs">
                  <Avatar name={log.userName} avatar={log.userAvatar} size="xs" />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 leading-snug">
                      <strong className="text-white font-semibold">{log.userName}</strong>{' '}
                      <span className="text-slate-400">{log.action}</span>
                    </p>
                    <p className="text-blue-400 font-medium truncate mt-0.5">{log.objectTitle}</p>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                      {formatRelativeTime(log.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Accountability Tip Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>VUEW Rule</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              When work hits 100%, tasks advance into <strong>IN REVIEW</strong>. Admins approve or
              request specific changes with feedback directly inside the thread.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
