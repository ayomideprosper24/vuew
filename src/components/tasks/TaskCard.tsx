import React from 'react';
import { Clock, AlertCircle, CheckCircle2, ChevronRight, Paperclip } from 'lucide-react';
import { Task } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { Avatar } from '../common/Avatar';
import { getDaysRemaining } from '../../utils/helpers';

interface TaskCardProps {
  task: Task;
  showProject?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, showProject = true }) => {
  const { setSelectedTaskId, setProgressUpdateTaskId, projects } = useData();
  const { allUsers, canUpdateProgress } = useAuth();

  const assignee = allUsers.find((u) => u.id === task.assigneeId);
  const project = projects.find((p) => p.id === task.projectId);
  const deadlineInfo = getDaysRemaining(task.dueDate);
  const isAllowedToUpdate = canUpdateProgress(task.assigneeId);

  return (
    <div
      onClick={() => setSelectedTaskId(task.id)}
      className={`group relative rounded-xl bg-slate-900/90 border p-4 transition-all duration-200 hover:shadow-lg cursor-pointer ${
        task.status === 'BLOCKED'
          ? 'border-rose-500/40 hover:border-rose-500/70 bg-rose-950/10'
          : task.health === 'AT_RISK'
          ? 'border-amber-500/40 hover:border-amber-500/70'
          : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900'
      }`}
    >
      {/* Top Meta row */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-blue-400">{task.id}</span>
          {showProject && project && (
            <span className="text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50 truncate max-w-[130px]">
              {project.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Badge variant="priority" priority={task.priority} size="sm" />
          <Badge variant="status" status={task.status} size="sm" />
        </div>
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-slate-100 group-hover:text-white leading-snug mb-2 line-clamp-2">
        {task.title}
      </h4>

      {/* Blocker Alert Banner if blocked */}
      {task.status === 'BLOCKED' && task.blockedReason && (
        <div className="mb-3 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-rose-300 text-xs">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2 leading-tight">
            <strong>Blocked:</strong> {task.blockedReason}
          </span>
        </div>
      )}

      {/* Latest progress update snippet if available */}
      {task.latestProgressUpdate && (
        <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed italic bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
          &ldquo;{task.latestProgressUpdate}&rdquo;
        </p>
      )}

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-mono">
          <span>Progress</span>
          <span className="text-slate-200 font-bold">{task.progress}%</span>
        </div>
        <ProgressBar progress={task.progress} status={task.status} health={task.health} height="sm" />
      </div>

      {/* Bottom info row: Assignee, Attachments, Deadline, Action */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/70 text-xs">
        <div className="flex items-center gap-2">
          {assignee && (
            <div className="flex items-center gap-1.5" title={`Assigned to ${assignee.name}`}>
              <Avatar name={assignee.name} avatar={assignee.avatar} size="xs" />
              <span className="text-[11px] text-slate-400 truncate max-w-[90px]">{assignee.name.split(' ')[0]}</span>
            </div>
          )}
          {task.attachments.length > 0 && (
            <span className="flex items-center gap-0.5 text-[11px] text-slate-400" title={`${task.attachments.length} attachments`}>
              <Paperclip className="w-3 h-3" />
              {task.attachments.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Deadline indicator */}
          <div
            className={`flex items-center gap-1 text-[11px] font-medium ${
              deadlineInfo.isOverdue
                ? 'text-rose-400 font-semibold'
                : deadlineInfo.days <= 2
                ? 'text-amber-400'
                : 'text-slate-400'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>{deadlineInfo.text}</span>
          </div>

          {/* Quick update button if allowed */}
          {isAllowedToUpdate && task.status !== 'COMPLETED' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setProgressUpdateTaskId(task.id);
              }}
              className="p-1 rounded bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white transition-colors"
              title="Update Progress"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
