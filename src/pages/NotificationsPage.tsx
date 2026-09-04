import React, { useState } from 'react';
import { Bell, CheckCircle2, Clock, Check, ArrowRight, MessageSquare, AlertCircle } from 'lucide-react';
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
    if (activeFilter === 'TASKS') return n.type === 'TASK_ASSIGNED' || n.type === 'TASK_UPDATED' || n.type === 'TASK_REVIEW_REQUESTED';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-400" />
            <span>Notifications Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated alerts for new task assignments, review requests, progress logs, and teammate mentions.
          </p>
        </div>

        {unreadNotificationCount > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {(
          [
            { id: 'ALL', label: 'All', count: notifications.length },
            { id: 'UNREAD', label: 'Unread', count: unreadNotificationCount },
            { id: 'TASKS', label: 'Task Updates', count: notifications.filter((n) => n.taskId).length },
            { id: 'MENTIONS', label: 'Mentions', count: notifications.filter((n) => n.type === 'MENTION').length },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeFilter === tab.id
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeFilter === tab.id ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40">
            <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-300">No notifications found</p>
            <p className="text-xs text-slate-400 mt-1">You are completely up to speed on all tasks.</p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n.id, n.taskId)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 group ${
                !n.read
                  ? 'bg-slate-900 border-blue-500/40 hover:border-blue-500/70 shadow-sm'
                  : 'bg-slate-900/50 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    !n.read ? 'bg-blue-500 ring-2 ring-blue-500/20' : 'bg-slate-700'
                  }`}
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`text-xs font-bold ${!n.read ? 'text-white' : 'text-slate-300'}`}>
                      {n.title}
                    </h4>
                    {n.taskId && (
                      <span className="text-[10px] font-mono text-blue-400 bg-blue-950/60 px-1.5 py-0.2 rounded border border-blue-500/30">
                        {n.taskId}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-2 block font-mono">
                    {formatRelativeTime(n.createdAt)}
                  </span>
                </div>
              </div>

              {n.taskId && (
                <div className="flex-shrink-0 self-center">
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
