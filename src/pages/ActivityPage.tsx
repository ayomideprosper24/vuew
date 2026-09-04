import React, { useState } from 'react';
import { Activity, Search, Filter, History } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Avatar } from '../components/common/Avatar';
import { formatRelativeTime } from '../utils/helpers';

export const ActivityPage: React.FC = () => {
  const { activityLogs, setSelectedTaskId } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = activityLogs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.userName.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.objectTitle.toLowerCase().includes(q) ||
      (log.details && log.details.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-400" />
          <span>System Activity &amp; Audit Log</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Full immutable trail of every task update, progress milestone, blocker escalation, and review decision.
        </p>
      </div>

      {/* Search Filter */}
      <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter activity by person, task code, action..."
          className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Activity Timeline */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
        <div className="space-y-4 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-800">
          {filteredLogs.map((log) => (
            <div key={log.id} className="relative flex items-start gap-4 pl-10">
              <div className="absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-blue-500" />
              <div className="flex-1 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Avatar name={log.userName} avatar={log.userAvatar} size="xs" />
                    <span className="font-semibold text-slate-200">{log.userName}</span>
                    <span className="text-slate-400">{log.action}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatRelativeTime(log.timestamp)}
                  </span>
                </div>

                <div
                  onClick={() => log.objectId.startsWith('VUEW-') && setSelectedTaskId(log.objectId)}
                  className={`font-semibold text-blue-400 ${
                    log.objectId.startsWith('VUEW-') ? 'cursor-pointer hover:underline' : ''
                  }`}
                >
                  {log.objectTitle}
                </div>

                {log.details && (
                  <p className="text-slate-300 mt-1.5 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                    &ldquo;{log.details}&rdquo;
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
