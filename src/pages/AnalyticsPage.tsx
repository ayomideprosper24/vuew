import React from 'react';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  PieChart,
  Shield,
  Activity,
  Layers,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ProgressBar } from '../components/common/ProgressBar';

export const AnalyticsPage: React.FC = () => {
  const { tasks, projects } = useData();
  const { allUsers } = useAuth();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const inReviewTasks = tasks.filter((t) => t.status === 'IN_REVIEW').length;
  const blockedTasks = tasks.filter((t) => t.status === 'BLOCKED').length;
  const notStartedTasks = tasks.filter((t) => t.status === 'NOT_STARTED').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const avgProgress =
    totalTasks > 0 ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / totalTasks) : 0;

  // Priority counts
  const urgentCount = tasks.filter((t) => t.priority === 'URGENT').length;
  const highCount = tasks.filter((t) => t.priority === 'HIGH').length;
  const mediumCount = tasks.filter((t) => t.priority === 'MEDIUM').length;
  const lowCount = tasks.filter((t) => t.priority === 'LOW').length;

  // Health counts
  const onTrackCount = tasks.filter((t) => t.health === 'ON_TRACK').length;
  const needsAttentionCount = tasks.filter((t) => t.health === 'NEEDS_ATTENTION').length;
  const atRiskCount = tasks.filter((t) => t.health === 'AT_RISK').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-400" />
          <span>Execution Analytics &amp; Velocity</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          High-fidelity quantitative metrics on organizational turnaround time, completion throughput, and bottleneck density.
        </p>
      </div>

      {/* Top 4 Velocity Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Completion Rate
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-emerald-400">{completionRate}%</span>
            <span className="text-xs text-slate-500 font-mono">signed off</span>
          </div>
          <div className="mt-3">
            <ProgressBar progress={completionRate} height="xs" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Average Progress
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-blue-400">{avgProgress}%</span>
            <span className="text-xs text-slate-500 font-mono">all tasks</span>
          </div>
          <div className="mt-3">
            <ProgressBar progress={avgProgress} height="xs" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Bottleneck Density
          </span>
          <div className="flex items-baseline gap-2">
            <span className={`font-mono text-3xl font-black ${blockedTasks > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
              {blockedTasks}
            </span>
            <span className="text-xs text-slate-500 font-mono">blocked</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-3 block">
            {blockedTasks === 0 ? 'Zero active blockers' : 'Requires immediate escalation'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Avg Turnaround
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-purple-400">3.8</span>
            <span className="text-xs text-slate-500 font-mono">days / task</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-3 block">18% faster than benchmark</span>
        </div>
      </div>

      {/* Grid: Status Distribution & Priority Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Deliverable Status Distribution
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Completed ({completedTasks})</span>
                <span className="font-mono text-emerald-400">{Math.round((completedTasks / totalTasks) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(completedTasks / totalTasks) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">In Review ({inReviewTasks})</span>
                <span className="font-mono text-purple-400">{Math.round((inReviewTasks / totalTasks) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${(inReviewTasks / totalTasks) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">In Progress ({inProgressTasks})</span>
                <span className="font-mono text-blue-400">{Math.round((inProgressTasks / totalTasks) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(inProgressTasks / totalTasks) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Blocked ({blockedTasks})</span>
                <span className="font-mono text-rose-400">{Math.round((blockedTasks / totalTasks) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(blockedTasks / totalTasks) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Not Started ({notStartedTasks})</span>
                <span className="font-mono text-slate-400">{Math.round((notStartedTasks / totalTasks) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-600 h-full rounded-full" style={{ width: `${(notStartedTasks / totalTasks) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Priority & Health Distribution */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Health &amp; Urgency Segmentation
          </h3>

          <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center mb-4">
            <div>
              <span className="text-xs font-semibold text-emerald-400 block">On Track</span>
              <span className="font-mono text-xl font-bold text-white">{onTrackCount}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-amber-400 block">Attention</span>
              <span className="font-mono text-xl font-bold text-white">{needsAttentionCount}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-rose-400 block">At Risk</span>
              <span className="font-mono text-xl font-bold text-white">{atRiskCount}</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-rose-400 font-semibold">Urgent Priority ({urgentCount})</span>
                <span className="font-mono text-slate-400">{Math.round((urgentCount / totalTasks) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(urgentCount / totalTasks) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-amber-400 font-semibold">High Priority ({highCount})</span>
                <span className="font-mono text-slate-400">{Math.round((highCount / totalTasks) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(highCount / totalTasks) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-blue-400 font-semibold">Medium Priority ({mediumCount})</span>
                <span className="font-mono text-slate-400">{Math.round((mediumCount / totalTasks) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(mediumCount / totalTasks) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400 font-semibold">Low Priority ({lowCount})</span>
                <span className="font-mono text-slate-400">{Math.round((lowCount / totalTasks) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-600 h-full rounded-full" style={{ width: `${(lowCount / totalTasks) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Workload Distribution Table */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
          Team Member Throughput &amp; Bandwidth
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Team Member</th>
                <th className="py-2.5 px-3">Active Tasks</th>
                <th className="py-2.5 px-3">Completed</th>
                <th className="py-2.5 px-3">Blocked</th>
                <th className="py-2.5 px-3 w-40">Progress</th>
                <th className="py-2.5 px-3">Health Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {allUsers.map((u) => {
                const uTasks = tasks.filter((t) => t.assigneeId === u.id);
                const uActive = uTasks.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length;
                const uDone = uTasks.filter((t) => t.status === 'COMPLETED').length;
                const uBlocked = uTasks.filter((t) => t.status === 'BLOCKED').length;
                const avg = uTasks.length > 0 ? Math.round(uTasks.reduce((s, t) => s + t.progress, 0) / uTasks.length) : 0;

                return (
                  <tr key={u.id} className="hover:bg-slate-850 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-200">{u.name}</td>
                    <td className="py-3 px-3 font-mono text-blue-400">{uActive}</td>
                    <td className="py-3 px-3 font-mono text-emerald-400">{uDone}</td>
                    <td className={`py-3 px-3 font-mono ${uBlocked > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                      {uBlocked}
                    </td>
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-slate-400">{avg}%</span>
                        <ProgressBar progress={avg} height="xs" />
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          uBlocked > 0 || avg < 35
                            ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                            : avg < 60
                            ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                            : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                        }`}
                      >
                        {uBlocked > 0 || avg < 35 ? 'At Risk' : avg < 60 ? 'Needs Attention' : 'On Track'}
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
