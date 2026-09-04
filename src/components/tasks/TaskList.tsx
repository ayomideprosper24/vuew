import React from 'react';
import { Clock, AlertCircle, CheckCircle2, MoreHorizontal, Paperclip } from 'lucide-react';
import { Task } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { Avatar } from '../common/Avatar';
import { formatDate, getDaysRemaining } from '../../utils/helpers';

interface TaskListProps {
  tasks: Task[];
  showAssignee?: boolean;
  showProject?: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  showAssignee = true,
  showProject = true,
}) => {
  const { setSelectedTaskId, setProgressUpdateTaskId, projects } = useData();
  const { allUsers, canUpdateProgress } = useAuth();

  if (tasks.length === 0) {
    return (
      <div className="w-full rounded-lg border border-slate-800 bg-slate-900/40 p-8 text-center text-xs text-slate-500">
        No tasks found matching current filters.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-slate-800 bg-slate-900/40">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-semibold text-slate-400 uppercase tracking-wider select-none">
          <tr>
            <th className="py-3 px-4">Task</th>
            {showProject && <th className="py-3 px-3">Project</th>}
            {showAssignee && <th className="py-3 px-3">Assignee</th>}
            <th className="py-3 px-3">Priority</th>
            <th className="py-3 px-3 w-36">Progress</th>
            <th className="py-3 px-3">Status</th>
            <th className="py-3 px-3">Deadline</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {tasks.map((task) => {
            const project = projects.find((p) => p.id === task.projectId);
            const assignee = allUsers.find((u) => u.id === task.assigneeId);
            const deadline = getDaysRemaining(task.dueDate);
            const isAllowedToUpdate = canUpdateProgress(task.assigneeId);

            return (
              <tr
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                className={`hover:bg-slate-850 cursor-pointer transition-colors group ${
                  task.status === 'BLOCKED' ? 'bg-rose-950/10' : ''
                }`}
              >
                {/* Task ID + Title */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2 max-w-xs sm:max-w-sm md:max-w-md">
                    <span className="font-mono text-xs font-bold text-blue-400 flex-shrink-0">
                      {task.id}
                    </span>
                    <span className="font-medium text-slate-100 group-hover:text-white truncate">
                      {task.title}
                    </span>
                    {task.status === 'BLOCKED' && (
                      <span className="flex-shrink-0 text-rose-400" title={`Blocked: ${task.blockedReason}`}>
                        <AlertCircle className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {task.attachments.length > 0 && (
                      <span className="flex-shrink-0 text-slate-500" title={`${task.attachments.length} attachments`}>
                        <Paperclip className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </td>

                {/* Project */}
                {showProject && (
                  <td className="py-3 px-3">
                    <span className="text-slate-400 truncate block max-w-[110px]">
                      {project?.name || '—'}
                    </span>
                  </td>
                )}

                {/* Assignee */}
                {showAssignee && (
                  <td className="py-3 px-3">
                    {assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar name={assignee.name} avatar={assignee.avatar} size="xs" />
                        <span className="text-slate-200 truncate max-w-[100px]">{assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-slate-500">Unassigned</span>
                    )}
                  </td>
                )}

                {/* Priority */}
                <td className="py-3 px-3">
                  <Badge variant="priority" priority={task.priority} size="sm" />
                </td>

                {/* Progress */}
                <td className="py-3 px-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>{task.progress}%</span>
                    </div>
                    <ProgressBar progress={task.progress} status={task.status} health={task.health} height="sm" />
                  </div>
                </td>

                {/* Status */}
                <td className="py-3 px-3">
                  <Badge variant="status" status={task.status} size="sm" />
                </td>

                {/* Deadline */}
                <td className="py-3 px-3 whitespace-nowrap">
                  <div
                    className={`flex items-center gap-1 font-mono ${
                      deadline.isOverdue
                        ? 'text-rose-400 font-bold'
                        : deadline.days <= 2
                        ? 'text-amber-400'
                        : 'text-slate-400'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(task.dueDate)}</span>
                  </div>
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {isAllowedToUpdate && task.status !== 'COMPLETED' && (
                      <button
                        onClick={() => setProgressUpdateTaskId(task.id)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors text-[11px] font-medium flex items-center gap-1"
                        title="Update Progress"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="hidden xl:inline">Update</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
