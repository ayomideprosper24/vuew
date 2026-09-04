import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  AlertCircle,
  LayoutList,
  Kanban,
  CalendarDays,
  Check,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { TaskList } from '../components/tasks/TaskList';
import { TaskBoard } from '../components/tasks/TaskBoard';
import { TaskCalendar } from '../components/tasks/TaskCalendar';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge } from '../components/common/Badge';
import { formatDate, formatRelativeTime } from '../utils/helpers';

export const MyWorkPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { tasks, setProgressUpdateTaskId, setSelectedTaskId } = useData();

  const [activeFilter, setActiveFilter] = useState<
    'ALL' | 'TODAY' | 'UPCOMING' | 'OVERDUE' | 'COMPLETED' | 'BLOCKED'
  >('ALL');
  const [viewMode, setViewMode] = useState<'LIST' | 'BOARD' | 'CALENDAR'>('LIST');

  const now = new Date('2026-09-04T14:39:36Z').getTime();

  // Tasks assigned to me
  const myTasks = tasks.filter((t) => t.assigneeId === currentUser.id);

  // My metrics
  const myActive = myTasks.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
  const myCompleted = myTasks.filter((t) => t.status === 'COMPLETED');
  const myOverdue = myTasks.filter((t) => {
    if (t.status === 'COMPLETED' || t.status === 'CANCELLED') return false;
    return new Date(t.dueDate).getTime() < now;
  });
  const myDueToday = myTasks.filter((t) => {
    if (t.status === 'COMPLETED' || t.status === 'CANCELLED') return false;
    return t.dueDate === '2026-09-04';
  });
  const myBlocked = myTasks.filter((t) => t.status === 'BLOCKED');

  // Filtered task list
  const filteredTasks = myTasks.filter((t) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'TODAY') return t.dueDate === '2026-09-04' && t.status !== 'COMPLETED';
    if (activeFilter === 'UPCOMING') {
      const diff = (new Date(t.dueDate).getTime() - now) / (1000 * 60 * 60 * 24);
      return diff > 0 && t.status !== 'COMPLETED';
    }
    if (activeFilter === 'OVERDUE') {
      return new Date(t.dueDate).getTime() < now && t.status !== 'COMPLETED';
    }
    if (activeFilter === 'COMPLETED') return t.status === 'COMPLETED';
    if (activeFilter === 'BLOCKED') return t.status === 'BLOCKED';
    return true;
  });

  // Current Focus Task (highest priority active task or first active task)
  const focusTask =
    myActive.find((t) => t.priority === 'URGENT') ||
    myActive.find((t) => t.priority === 'HIGH') ||
    myActive[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Personalized Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-950/30 via-slate-900 to-slate-950 border border-slate-800">
        <div>
          <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest block mb-1">
            PERSONAL ACCOUNTABILITY HUB
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Good morning, {currentUser.name.split(' ')[0]} 👋
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Here is your daily deliverable checklist. Keep status and blockers transparent.
          </p>
        </div>

        {focusTask && (
          <button
            onClick={() => setProgressUpdateTaskId(focusTask.id)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Update Active Task</span>
          </button>
        )}
      </div>

      {/* 4 Quick Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveFilter('ALL')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeFilter === 'ALL'
              ? 'bg-blue-950/30 border-blue-500/50'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-750'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase">Active Tasks</span>
            <CheckSquare className="w-4 h-4 text-blue-400" />
          </div>
          <span className="font-mono text-2xl font-bold text-white">{myActive.length}</span>
        </div>

        <div
          onClick={() => setActiveFilter('TODAY')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeFilter === 'TODAY'
              ? 'bg-blue-950/30 border-blue-500/50'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-750'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase">Due Today</span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-mono text-2xl font-bold text-emerald-400">{myDueToday.length}</span>
        </div>

        <div
          onClick={() => setActiveFilter('OVERDUE')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeFilter === 'OVERDUE'
              ? 'bg-rose-950/30 border-rose-500/50'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-750'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-rose-400 uppercase">Overdue</span>
            <Clock className="w-4 h-4 text-rose-400" />
          </div>
          <span className="font-mono text-2xl font-bold text-rose-400">{myOverdue.length}</span>
        </div>

        <div
          onClick={() => setActiveFilter('COMPLETED')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeFilter === 'COMPLETED'
              ? 'bg-emerald-950/30 border-emerald-500/50'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-750'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <span className="font-mono text-2xl font-bold text-purple-400">{myCompleted.length}</span>
        </div>
      </div>

      {/* CURRENT FOCUS SPOTLIGHT */}
      {focusTask && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-blue-500/40 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-600 text-white">
                <Flame className="w-3.5 h-3.5" /> CURRENT FOCUS
              </span>
              <span className="font-mono text-xs font-bold text-blue-400">{focusTask.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="priority" priority={focusTask.priority} size="sm" />
              <Badge variant="status" status={focusTask.status} size="sm" />
            </div>
          </div>

          <h3
            onClick={() => setSelectedTaskId(focusTask.id)}
            className="text-lg font-bold text-white hover:text-blue-300 transition-colors cursor-pointer mb-2"
          >
            {focusTask.title}
          </h3>

          <p className="text-xs text-slate-300 mb-4 line-clamp-2 leading-relaxed">
            {focusTask.description}
          </p>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-mono">
              <span>Overall Progress</span>
              <span className="text-blue-400 font-bold text-sm">{focusTask.progress}%</span>
            </div>
            <ProgressBar
              progress={focusTask.progress}
              status={focusTask.status}
              health={focusTask.health}
              height="md"
            />
          </div>

          {/* Pillars: Latest Update, Next Step, Blocker */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                LATEST UPDATE
              </span>
              <p className="text-slate-300 italic line-clamp-2">
                &ldquo;{focusTask.latestProgressUpdate || 'No updates logged yet.'}&rdquo;
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                NEXT STEP
              </span>
              <p className="text-slate-300 line-clamp-2">
                {focusTask.nextStep || 'Pending definition.'}
              </p>
            </div>

            <div
              className={`p-3 rounded-xl border text-xs ${
                focusTask.status === 'BLOCKED'
                  ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300'
              }`}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider block mb-1">
                BLOCKER
              </span>
              <p className="line-clamp-2">
                {focusTask.status === 'BLOCKED' && focusTask.blockedReason ? (
                  <strong className="text-rose-400">{focusTask.blockedReason}</strong>
                ) : (
                  <span className="text-emerald-400 font-medium">No blocker. Clear to execute.</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/60">
            <span className="text-xs text-slate-400 font-mono">
              Due: {formatDate(focusTask.dueDate)} • Est: {formatDate(focusTask.estimatedCompletionDate)}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedTaskId(focusTask.id)}
                className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 transition-colors"
              >
                Inspect Details
              </button>
              <button
                onClick={() => setProgressUpdateTaskId(focusTask.id)}
                className="text-xs text-white px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-medium transition-colors"
              >
                Update Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs & View Modes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { id: 'ALL', label: 'All Tasks', count: myTasks.length },
              { id: 'TODAY', label: 'Due Today', count: myDueToday.length },
              { id: 'UPCOMING', label: 'Upcoming', count: myTasks.filter((t) => t.status !== 'COMPLETED').length },
              { id: 'OVERDUE', label: 'Overdue', count: myOverdue.length },
              { id: 'BLOCKED', label: 'Blocked', count: myBlocked.length },
              { id: 'COMPLETED', label: 'Completed', count: myCompleted.length },
            ] as const
          ).map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeFilter === filter.id
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{filter.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  activeFilter === filter.id ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {/* View Mode Switcher: List, Board, Calendar */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('LIST')}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
              viewMode === 'LIST'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="List View"
          >
            <LayoutList className="w-4 h-4" />
            <span className="hidden sm:inline">List</span>
          </button>
          <button
            onClick={() => setViewMode('BOARD')}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
              viewMode === 'BOARD'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Board View"
          >
            <Kanban className="w-4 h-4" />
            <span className="hidden sm:inline">Board</span>
          </button>
          <button
            onClick={() => setViewMode('CALENDAR')}
            className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
              viewMode === 'CALENDAR'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Calendar View"
          >
            <CalendarDays className="w-4 h-4" />
            <span className="hidden sm:inline">Calendar</span>
          </button>
        </div>
      </div>

      {/* Render selected view */}
      <div>
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40">
            <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-300">No tasks in this filter view</p>
            <p className="text-xs text-slate-400 mt-1">You are all caught up on deliverables.</p>
          </div>
        ) : viewMode === 'LIST' ? (
          <TaskList tasks={filteredTasks} showAssignee={false} />
        ) : viewMode === 'BOARD' ? (
          <TaskBoard tasks={filteredTasks} />
        ) : (
          <TaskCalendar tasks={filteredTasks} />
        )}
      </div>
    </div>
  );
};
