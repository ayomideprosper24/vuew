import React from 'react';
import {
  ListTodo,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Plus,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ProgressBar } from '../components/common/ProgressBar';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';
import { formatDate, formatRelativeTime } from '../utils/helpers';
import { Task } from '../types';

interface DashboardPageProps {
  onNavigateToTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateToTab }) => {
  const { tasks, projects, activityLogs, setSelectedTaskId, setProgressUpdateTaskId, setCreateTaskModalOpen } =
    useData();
  const { allUsers, currentUser, canCreateTask } = useAuth();

  // Reference timestamp: 2026-09-04
  const now = new Date('2026-09-04T14:39:36Z').getTime();

  // Metrics
  const activeTasks = tasks.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
  const overdueTasks = tasks.filter((t) => {
    if (t.status === 'COMPLETED' || t.status === 'CANCELLED') return false;
    return new Date(t.dueDate).getTime() < now;
  });

  const dueTodayTasks = tasks.filter((t) => {
    if (t.status === 'COMPLETED' || t.status === 'CANCELLED') return false;
    return t.dueDate === '2026-09-04';
  });

  const completedThisWeekTasks = tasks.filter((t) => {
    if (t.status !== 'COMPLETED') return false;
    return true;
  });

  const blockedTasks = tasks.filter((t) => t.status === 'BLOCKED');
  const atRiskTasks = tasks.filter((t) => t.health === 'AT_RISK' && t.status !== 'COMPLETED');

  // My Tasks
  const myTasks = tasks.filter(
    (t) => t.assigneeId === currentUser.id && t.status !== 'COMPLETED' && t.status !== 'CANCELLED'
  );

  // Individual Team Status
  const teamStatusList = allUsers.map((member) => {
    const userTasks = tasks.filter((t) => t.assigneeId === member.id);
    const userActive = userTasks.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
    const userOverdue = userTasks.filter((t) => {
      if (t.status === 'COMPLETED' || t.status === 'CANCELLED') return false;
      return new Date(t.dueDate).getTime() < now;
    });
    const avg =
      userTasks.length > 0
        ? Math.round(userTasks.reduce((sum, t) => sum + t.progress, 0) / userTasks.length)
        : 0;

    const hasBlocked = userTasks.some((t) => t.status === 'BLOCKED');
    const hasAtRisk = userTasks.some((t) => t.health === 'AT_RISK');

    let status = 'On track';
    let statusClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (hasBlocked || userOverdue.length > 0) {
      status = 'Needs attention';
      statusClass = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    } else if (hasAtRisk || avg < 40) {
      status = 'At risk';
      statusClass = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    }

    return {
      member,
      activeCount: userActive.length,
      overdueCount: userOverdue.length,
      progress: avg,
      status,
      statusClass,
    };
  });

  // Greeting based on time
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 pb-12">
      {/* Concise Header Overview */}
      <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {greeting}, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            <span className="text-white font-semibold">{activeTasks.length}</span> active tasks
            <span className="text-slate-600 mx-2">·</span>
            <span className={dueTodayTasks.length > 0 ? 'text-blue-400 font-semibold' : 'text-slate-400'}>
              {dueTodayTasks.length} due today
            </span>
            <span className="text-slate-600 mx-2">·</span>
            <span className={overdueTasks.length > 0 ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
              {overdueTasks.length} overdue
            </span>
            <span className="text-slate-600 mx-2">·</span>
            <span className="text-emerald-400 font-semibold">{completedThisWeekTasks.length} completed</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {canCreateTask && (
            <button
              onClick={() => setCreateTaskModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>
          )}
          <button
            onClick={() => onNavigateToTab('my-work')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-colors"
          >
            <span>My Work</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column (My Work & Team Execution) + Right Column (Team Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* MY WORK SECTION */}
          <div className="border border-slate-800 rounded-lg bg-slate-900/40 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  My Work
                </h2>
                <span className="text-[11px] font-mono text-slate-500">
                  ({myTasks.length})
                </span>
              </div>
              <button
                onClick={() => onNavigateToTab('my-work')}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {myTasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No active tasks assigned to you.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {myTasks.slice(0, 5).map((task) => {
                  const project = projects.find((p) => p.id === task.projectId);
                  const isOverdue = new Date(task.dueDate).getTime() < now;

                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className="px-4 py-3 flex items-center justify-between gap-4 hover:bg-slate-900/80 cursor-pointer transition-colors group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-blue-400">
                            {task.id}
                          </span>
                          <span className="text-xs text-slate-200 group-hover:text-white font-medium truncate">
                            {task.title}
                          </span>
                          {project && (
                            <span className="hidden sm:inline-block text-[10px] text-slate-500 font-mono">
                              • {project.name}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400">
                          <span className="font-mono text-slate-300">{task.progress}%</span>
                          <div className="w-24">
                            <ProgressBar progress={task.progress} height="xs" />
                          </div>
                          <span className={isOverdue ? 'text-rose-400 font-medium' : 'text-slate-400'}>
                            Due {formatDate(task.dueDate)}
                          </span>
                          {task.status === 'BLOCKED' && (
                            <span className="text-rose-400 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Blocked
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="status" status={task.status} size="sm" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ATTENTION REQUIRED (Blocked & At-Risk Tasks) */}
          {(blockedTasks.length > 0 || atRiskTasks.length > 0) && (
            <div className="border border-slate-800 rounded-lg bg-slate-900/40 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Needs Attention
                  </h2>
                  <span className="text-[11px] font-mono text-slate-500">
                    ({blockedTasks.length + atRiskTasks.length})
                  </span>
                </div>
                <button
                  onClick={() => onNavigateToTab('tasks')}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  View in Tasks
                </button>
              </div>

              <div className="divide-y divide-slate-800/80">
                {blockedTasks.concat(atRiskTasks.filter((t) => t.status !== 'BLOCKED')).slice(0, 4).map((task) => {
                  const assignee = allUsers.find((u) => u.id === task.assigneeId);
                  const isBlocked = task.status === 'BLOCKED';

                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-slate-900/80 cursor-pointer transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-400">
                            {task.id}
                          </span>
                          <span className="text-xs text-slate-200 font-medium truncate">
                            {task.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {isBlocked
                            ? `Blocker: ${task.blockedReason || 'Unspecified blocker'}`
                            : `At risk: Due ${formatDate(task.dueDate)} (${task.progress}% complete)`}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        {assignee && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Avatar name={assignee.name} avatar={assignee.avatar} size="xs" />
                            <span className="hidden sm:inline text-[11px]">{assignee.name}</span>
                          </div>
                        )}
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                            isBlocked
                              ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                              : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                          }`}
                        >
                          {isBlocked ? 'Blocked' : 'At Risk'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TEAM EXECUTION OVERVIEW */}
          <div className="border border-slate-800 rounded-lg bg-slate-900/40 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Team Status
              </h2>
              {currentUser.role === 'ADMIN' && (
                <button
                  onClick={() => onNavigateToTab('team')}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  <span>Manage Team</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/60 text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Member</th>
                    <th className="py-2.5 px-3 font-semibold">Active Tasks</th>
                    <th className="py-2.5 px-3 font-semibold">Progress</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {teamStatusList.map(({ member, activeCount, overdueCount, progress, status, statusClass }) => (
                    <tr key={member.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={member.name} avatar={member.avatar} size="xs" />
                          <div>
                            <span className="font-medium text-slate-200 block truncate">
                              {member.name}
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate">
                              {member.jobTitle}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono text-slate-300">{activeCount}</span>
                        {overdueCount > 0 && (
                          <span className="text-rose-400 text-[10px] ml-1 font-mono font-semibold">
                            ({overdueCount} overdue)
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-200 w-8">{progress}%</span>
                          <div className="w-16 hidden sm:block">
                            <ProgressBar progress={progress} height="xs" />
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${statusClass}`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Team Activity Feed */}
        <div className="space-y-6">
          <div className="border border-slate-800 rounded-lg bg-slate-900/40 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Team Activity
              </h2>
              <button
                onClick={() => onNavigateToTab('activity')}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
              >
                <span>All activity</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {activityLogs.slice(0, 8).map((log) => (
                <div key={log.id} className="flex items-start gap-2.5 text-xs">
                  <Avatar name={log.userName} avatar={log.userAvatar} size="xs" />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 leading-snug">
                      <span className="font-medium text-white">{log.userName}</span>{' '}
                      <span className="text-slate-400">{log.action}</span>
                    </p>
                    <p className="text-blue-400 text-[11px] font-medium truncate mt-0.5">
                      {log.objectTitle}
                    </p>
                    <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                      {formatRelativeTime(log.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
