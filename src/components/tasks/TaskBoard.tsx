import React from 'react';
import { Task, TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';

interface TaskBoardProps {
  tasks: Task[];
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks }) => {
  const columns: { id: TaskStatus; label: string; countColor: string; borderColor: string }[] = [
    { id: 'NOT_STARTED', label: 'Not Started', countColor: 'text-slate-400', borderColor: 'border-slate-800' },
    { id: 'IN_PROGRESS', label: 'In Progress', countColor: 'text-blue-400', borderColor: 'border-blue-500/30' },
    { id: 'BLOCKED', label: 'Blocked', countColor: 'text-rose-400', borderColor: 'border-rose-500/30' },
    { id: 'IN_REVIEW', label: 'In Review', countColor: 'text-purple-400', borderColor: 'border-purple-500/30' },
    { id: 'COMPLETED', label: 'Completed', countColor: 'text-emerald-400', borderColor: 'border-emerald-500/30' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 overflow-x-auto pb-6 items-start">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            className="flex flex-col rounded-2xl bg-slate-950/60 border border-slate-800/80 p-3 min-w-[280px]"
          >
            {/* Column Header */}
            <div className={`flex items-center justify-between pb-3 mb-3 border-b ${col.borderColor}`}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-200 tracking-tight">{col.label}</span>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 font-bold ${col.countColor}`}
                >
                  {colTasks.length}
                </span>
              </div>
            </div>

            {/* Column Tasks */}
            <div className="space-y-3 min-h-[140px]">
              {colTasks.length === 0 ? (
                <div className="h-28 rounded-xl border border-dashed border-slate-850 flex items-center justify-center text-xs text-slate-400">
                  No tasks in {col.label.toLowerCase()}
                </div>
              ) : (
                colTasks.map((task) => <TaskCard key={task.id} task={task} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
