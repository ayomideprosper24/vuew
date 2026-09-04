import React, { useState } from 'react';
import { CheckCircle2, Check, ArrowRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatRelativeTime } from '../utils/helpers';

export const NotificationsPage: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setSelectedTaskId,
    unreadNotificationCount,
  } = useData();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNREAD' | 'TASKS' | 'MENTIONS'>('ALL');

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'UNREAD') return !n.read;
    if (activeFilter === 'TASKS')
      return (
        n.type === 'TASK_ASSIGNED' ||
        n.type === 'TASK_UPDATED' ||
        n.type === 'TASK_REVIEW_REQUESTED'
      );
    if (activeFilter === 'MENTIONS') return n.type === 'MENTION';
    return true;
  });

  const handleNotificationClick = (id: string, taskId?: string) => {
    markNotificationRead(id);
    if (taskId) {
      setSelectedTaskId(taskId);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Notifications
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Task assignments, status updates, and review requests.
          </p>
        </div>

        {unreadNotificationCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
        {(
          [
            { id: 'ALL', label: 'All', count: notifications.length },
            { id: 'UNREAD', label: 'Unread', count: unreadNotificationCount },
            { id: 'TASKS', label: 'Tasks', count: notifications.filter((n) => n.taskId).length },
            { id: 'MENTIONS', label: 'Mentions', count: notifications.filter((n) => n.type === 'MENTION').length },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeFilter === tab.id
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] font-mono px-1 rounded ${
                activeFilter === tab.id ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-1.5">
        {filtered.length === 0 ? (
          <div className="p-8 text-center rounded-lg border border-dashed border-slate-800 bg-slate-950/40">
            <CheckCircle2 className="w-6 h-6 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-300">No notifications</p>
            <p className="text-[11px] text-slate-500 mt-0.5">You are up to date on all items.</p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n.id, n.taskId)}
              className={`p-3 rounded-lg border transition-colors cursor-pointer flex items-start justify-between gap-3 group ${
                !n.read
                  ? 'bg-slate-900/80 border-slate-700 hover:border-slate-600'
                  : 'bg-slate-900/30 border-slate-800/80 hover:bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                    !n.read ? 'bg-blue-500' : 'bg-slate-700'
                  }`}
                />
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className={`text-xs font-semibold ${!n.read ? 'text-white' : 'text-slate-300'}`}>
                      {n.title}
                    </h2>
                    {n.taskId && (
                      <span className="text-[10px] font-mono text-blue-400">
                        {n.taskId}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                    {formatRelativeTime(n.createdAt)}
                  </span>
                </div>
              </div>

              {n.taskId && (
                <div className="flex-shrink-0 self-center">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 transition-colors" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
