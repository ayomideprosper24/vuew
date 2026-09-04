import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ProgressBar } from '../components/common/ProgressBar';
import { Avatar } from '../components/common/Avatar';

export const AnalyticsPage: React.FC = () => {
  const { tasks } = useData();
  const { allUsers } = useAuth();

  const now = new Date('2026-09-04T14:39:36Z').getTime();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const inReviewTasks = tasks.filter((t) => t.status === 'IN_REVIEW').length;
  const blockedTasks = tasks.filter((t) => t.status === 'BLOCKED').length;
  const pausedTasks = tasks.filter((t) => t.status === 'PAUSED').length;
  const notStartedTasks = tasks.filter((t) => t.status === 'NOT_STARTED').length;

  const overdueTasks = tasks.filter((t) => {
    if (t.status === 'COMPLETED' || t.status === 'CANCELLED') return false;
    return new Date(t.dueDate).getTime() < now;
  }).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const avgProgress =
    totalTasks > 0 ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / totalTasks) : 0;

  // Priority counts
  const urgentCount = tasks.filter((t) => t.priority === 'URGENT').length;
  const highCount = tasks.filter((t) => t.priority === 'HIGH').length;
  const mediumCount = tasks.filter((t) => t.priority === 'MEDIUM').length;
  const lowCount = tasks.filter((t) => t.priority === 'LOW').length;

  const statusList = [
    { label: 'Completed', count: completedTasks, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
    { label: 'In Review', count: inReviewTasks, color: 'bg-purple-500', textColor: 'text-purple-400' },
    { label: 'In Progress', count: inProgressTasks, color: 'bg-blue-500', textColor: 'text-blue-400' },
    { label: 'Blocked', count: blockedTasks, color: 'bg-rose-500', textColor: 'text-rose-400' },
    { label: 'Paused', count: pausedTasks, color: 'bg-amber-500', textColor: 'text-amber-400' },
    { label: 'Not Started', count: notStartedTasks, color: 'bg-slate-600', textColor: 'text-slate-400' },
  ];

  const priorityList = [
    { label: 'Urgent', count: urgentCount, color: 'bg-rose-500', textColor: 'text-rose-400' },
    { label: 'High', count: highCount, color: 'bg-amber-500', textColor: 'text-amber-400' },
    { label: 'Medium', count: mediumCount, color: 'bg-blue-500', textColor: 'text-blue-400' },
    { label: 'Low', count: lowCount, color: 'bg-slate-600', textColor: 'text-slate-400' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-xl font-bold text-white tracking-tight">
          Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Task completion, throughput, and project velocity.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Task Completion Rate
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-emerald-400">{completionRate}%</span>
            <span className="text-[11px] text-slate-500 font-mono">
              ({completedTasks}/{totalTasks})
            </span>
          </div>
          <div className="mt-2.5">
            <ProgressBar progress={completionRate} height="xs" />
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Overdue Tasks
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={`font-mono text-2xl font-bold ${
                overdueTasks > 0 ? 'text-rose-400' : 'text-slate-200'
              }`}
            >
              {overdueTasks}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">past deadline</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-2.5 block">
            {overdueTasks === 0 ? 'All deadlines on track' : 'Requires timeline adjustment'}
          </span>
        </div>

        <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Average Progress
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-blue-400">{avgProgress}%</span>
            <span className="text-[11px] text-slate-500 font-mono">across all tasks</span>
          </div>
          <div className="mt-2.5">
            <ProgressBar progress={avgProgress} height="xs" />
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Active Blockers
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={`font-mono text-2xl font-bold ${
                blockedTasks > 0 ? 'text-rose-400' : 'text-slate-200'
              }`}
            >
              {blockedTasks}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">flagged</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-2.5 block">
            {blockedTasks === 0 ? 'Zero active impediments' : 'Requires unblocking'}
          </span>
        </div>
      </div>

      {/* Breakdowns: Status & Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks by Status */}
        <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800 space-y-3">
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Tasks by Status
          </h2>

          <div className="space-y-2.5">
            {statusList.map((item) => {
              const pct = totalTasks > 0 ? Math.round((item.count / totalTasks) * 100) : 0;
              return (
                <div key={item.label} className="text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">{item.label}</span>
                    <span className="font-mono text-slate-400">
                      {item.count} <span className="text-slate-600">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`${item.color} h-full rounded-full transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tasks by Priority */}
        <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800 space-y-3">
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Tasks by Priority
          </h2>

          <div className="space-y-2.5">
            {priorityList.map((item) => {
              const pct = totalTasks > 0 ? Math.round((item.count / totalTasks) * 100) : 0;
              return (
                <div key={item.label} className="text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">{item.label}</span>
                    <span className="font-mono text-slate-400">
                      {item.count} <span className="text-slate-600">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`${item.color} h-full rounded-full transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Workload by Team Member */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800">
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Workload by Team Member
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Member</th>
                <th className="py-2.5 px-3">Active Tasks</th>
                <th className="py-2.5 px-3">Completed</th>
                <th className="py-2.5 px-3">Blocked</th>
                <th className="py-2.5 px-3 w-40">Progress</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {allUsers.map((user) => {
                const userTasks = tasks.filter((t) => t.assigneeId === user.id);
                const activeCount = userTasks.filter(
                  (t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED'
                ).length;
                const completedCount = userTasks.filter((t) => t.status === 'COMPLETED').length;
                const blockedCount = userTasks.filter((t) => t.status === 'BLOCKED').length;
                const avg =
                  userTasks.length > 0
                    ? Math.round(userTasks.reduce((s, t) => s + t.progress, 0) / userTasks.length)
                    : 0;

                const isBlocked = blockedCount > 0;
                const isAtRisk = avg < 35 && activeCount > 0;

                let status = 'On track';
                let statusStyle = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                if (isBlocked) {
                  status = 'Blocked';
                  statusStyle = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
                } else if (isAtRisk) {
                  status = 'At risk';
                  statusStyle = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
                }

                return (
                  <tr key={user.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <Avatar name={user.name} avatar={user.avatar} size="xs" />
                        <div>
                          <span className="font-medium text-slate-200 block truncate">
                            {user.name}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {user.jobTitle}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-200">{activeCount}</td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400">{completedCount}</td>
                    <td
                      className={`py-2.5 px-3 font-mono ${
                        blockedCount > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {blockedCount}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-slate-400">{avg}%</span>
                        <ProgressBar progress={avg} height="xs" />
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${statusStyle}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
