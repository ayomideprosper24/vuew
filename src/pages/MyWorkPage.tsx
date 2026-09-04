import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  Calendar,
  LayoutList,
  Kanban,
  CalendarDays,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { TaskList } from '../components/tasks/TaskList';
import { TaskBoard } from '../components/tasks/TaskBoard';
import { TaskCalendar } from '../components/tasks/TaskCalendar';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge } from '../components/common/Badge';
import { formatDate } from '../utils/helpers';

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            My Work
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Your active deliverables, deadlines, and progress logs.
          </p>
        </div>

        {focusTask && (
          <button
            onClick={() => setProgressUpdateTaskId(focusTask.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Update Active Task</span>
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`p-3 rounded-lg border text-left transition-colors ${
            activeFilter === 'ALL'
              ? 'bg-blue-950/20 border-blue-500/40'
              : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900/60'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Active Tasks
            </span>
            <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <span className="font-mono text-xl font-bold text-white">{myActive.length}</span>
        </button>

        <button
          onClick={() => setActiveFilter('TODAY')}
          className={`p-3 rounded-lg border text-left transition-colors ${
            activeFilter === 'TODAY'
              ? 'bg-blue-950/20 border-blue-500/40'
              : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900/60'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Due Today
            </span>
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="font-mono text-xl font-bold text-emerald-400">{myDueToday.length}</span>
        </button>

        <button
          onClick={() => setActiveFilter('OVERDUE')}
          className={`p-3 rounded-lg border text-left transition-colors ${
            activeFilter === 'OVERDUE'
              ? 'bg-rose-950/20 border-rose-500/40'
              : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900/60'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider">
              Overdue
            </span>
            <Clock className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <span className="font-mono text-xl font-bold text-rose-400">{myOverdue.length}</span>
        </button>

        <button
          onClick={() => setActiveFilter('COMPLETED')}
          className={`p-3 rounded-lg border text-left transition-colors ${
            activeFilter === 'COMPLETED'
              ? 'bg-emerald-950/20 border-emerald-500/40'
              : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900/60'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Completed
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <span className="font-mono text-xl font-bold text-purple-400">{myCompleted.length}</span>
        </button>
      </div>

      {/* Focus Task Card */}
      {focusTask && (
        <div className="p-4 rounded-lg bg-slate-900/40 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 uppercase tracking-wider">
                Current Focus
              </span>
              <span className="font-mono text-xs text-slate-400">{focusTask.id}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="priority" priority={focusTask.priority} size="sm" />
              <Badge variant="status" status={focusTask.status} size="sm" />
            </div>
          </div>

          <div>
            <h2
              onClick={() => setSelectedTaskId(focusTask.id)}
              className="text-sm font-semibold text-white hover:text-blue-400 cursor-pointer transition-colors"
            >
              {focusTask.title}
            </h2>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              {focusTask.description}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-mono">
              <span>Progress</span>
              <span className="text-blue-400 font-bold">{focusTask.progress}%</span>
            </div>
            <ProgressBar
              progress={focusTask.progress}
              status={focusTask.status}
              health={focusTask.health}
              height="sm"
            />
          </div>

          <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-800/80">
            <span className="text-slate-500 font-mono text-[11px]">
              Due: {formatDate(focusTask.dueDate)}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedTaskId(focusTask.id)}
                className="text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Inspect
              </button>
              <button
                onClick={() => setProgressUpdateTaskId(focusTask.id)}
                className="text-xs text-white px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 font-medium transition-colors"
              >
                Update Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter and View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { id: 'ALL', label: 'All', count: myTasks.length },
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
              className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeFilter === filter.id
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{filter.label}</span>
              <span
                className={`text-[10px] font-mono px-1 rounded ${
                  activeFilter === filter.id ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center p-0.5 rounded-md bg-slate-900/60 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('LIST')}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
              viewMode === 'LIST'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="List View"
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
          <button
            onClick={() => setViewMode('BOARD')}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
              viewMode === 'BOARD'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Board View"
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Board</span>
          </button>
          <button
            onClick={() => setViewMode('CALENDAR')}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
              viewMode === 'CALENDAR'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Calendar View"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Calendar</span>
          </button>
        </div>
      </div>

      {/* Render selected view */}
      <div>
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center rounded-lg border border-dashed border-slate-800 bg-slate-950/40">
            <CheckCircle2 className="w-6 h-6 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-300">No tasks in this view</p>
            <p className="text-[11px] text-slate-500 mt-0.5">You are all caught up on deliverables.</p>
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
