import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  User as UserIcon,
  AlertCircle,
  CheckCircle2,
  Paperclip,
  Send,
  MessageSquare,
  ShieldCheck,
  RotateCcw,
  History,
  FileText,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { Avatar } from '../common/Avatar';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatRelativeTime } from '../../utils/helpers';

interface TaskDetailModalProps {
  taskId: string | null;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ taskId, onClose }) => {
  const {
    tasks,
    projects,
    taskUpdates,
    comments,
    addComment,
    reviewTask,
    setProgressUpdateTaskId,
  } = useData();
  const { currentUser, allUsers, canReviewTask, canUpdateProgress } = useAuth();

  const [commentText, setCommentText] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [showReviewInput, setShowReviewInput] = useState(false);

  const task = tasks.find((t) => t.id === taskId);
  if (!task) return null;

  const assignee = allUsers.find((u) => u.id === task.assigneeId);
  const project = projects.find((p) => p.id === task.projectId);
  const historyUpdates = taskUpdates.filter((u) => u.taskId === task.id);
  const taskComments = comments.filter((c) => c.taskId === task.id);

  const isAllowedToUpdate = canUpdateProgress(task.assigneeId);
  const isAllowedToReview = canReviewTask;

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const mentions: string[] = [];
    const mentionMatches = commentText.match(/@(\w+\s?\w*)/g);
    if (mentionMatches) {
      mentionMatches.forEach((m) => mentions.push(m.replace('@', '').trim()));
    }

    addComment(task.id, commentText.trim(), mentions);
    setCommentText('');
  };

  const handleApprove = () => {
    reviewTask(task.id, 'APPROVE');
    setShowReviewInput(false);
  };

  const handleRequestChanges = () => {
    if (!reviewFeedback.trim()) {
      setShowReviewInput(true);
      return;
    }
    reviewTask(task.id, 'REQUEST_CHANGES', reviewFeedback);
    setReviewFeedback('');
    setShowReviewInput(false);
  };

  return (
    <Modal
      isOpen={!!taskId}
      onClose={onClose}
      title={task.title}
      subtitle={`${task.id} • ${project?.name || 'Workspace'}`}
      maxWidth="3xl"
    >
      <div className="space-y-6 text-sm">
        {/* Admin Review Banner (If status is IN_REVIEW) */}
        {task.status === 'IN_REVIEW' && (
          <div className="p-3.5 rounded-lg bg-blue-950/40 border border-blue-500/40 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Work Submitted for Review (100%)
                </h4>
                <p className="text-xs text-blue-200 mt-0.5">
                  Task completed by assignee. Awaiting administrative review.
                </p>
              </div>

              {isAllowedToReview && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleApprove}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => setShowReviewInput(!showReviewInput)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Request Changes</span>
                  </button>
                </div>
              )}
            </div>

            {showReviewInput && (
              <div className="pt-2 border-t border-blue-500/30 flex gap-2">
                <input
                  type="text"
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="Feedback on what needs to be changed..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleRequestChanges}
                  className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                >
                  Send Feedback
                </button>
              </div>
            )}
          </div>
        )}

        {/* Feedback note if previously requested */}
        {task.reviewFeedback && (
          <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
            <span className="font-semibold">Review Feedback:</span> {task.reviewFeedback}
          </div>
        )}

        {/* Description */}
        <div>
          <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Description
          </h4>
          <p className="text-slate-300 text-xs leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            {task.description || 'No description provided.'}
          </p>
        </div>

        {/* Details Grid */}
        <div>
          <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Details
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block mb-1">
                Assigned to
              </span>
              <div className="flex items-center gap-1.5">
                <Avatar name={assignee?.name || 'Unassigned'} avatar={assignee?.avatar} size="xs" />
                <span className="font-medium text-slate-200 truncate">
                  {assignee?.name || 'Unassigned'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase block mb-1">
                Priority
              </span>
              <Badge variant="priority" priority={task.priority} size="sm" />
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase block mb-1">
                Start Date
              </span>
              <span className="font-mono text-slate-300">{formatDate(task.startDate)}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase block mb-1">
                Due Date
              </span>
              <span className="font-mono text-slate-300">{formatDate(task.dueDate)}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase block mb-1">
                Est. Completion
              </span>
              <span className="font-mono text-slate-300">
                {formatDate(task.estimatedCompletionDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Progress
              </span>
              <span className="font-mono text-xs font-bold text-blue-400">{task.progress}%</span>
              <Badge variant="status" status={task.status} size="sm" />
            </div>

            {isAllowedToUpdate && task.status !== 'COMPLETED' && (
              <button
                onClick={() => {
                  onClose();
                  setProgressUpdateTaskId(task.id);
                }}
                className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
              >
                Update Progress
              </button>
            )}
          </div>
          <ProgressBar progress={task.progress} status={task.status} height="sm" />
        </div>

        {/* Latest Update, Next Step, Blocker */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Latest Update */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Latest Update
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {task.latestProgressUpdate || 'No updates logged yet.'}
              </p>
            </div>
            <span className="text-[10px] text-slate-500 mt-2 block font-mono">
              {formatRelativeTime(task.updatedAt)}
            </span>
          </div>

          {/* Next Step */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Next Step
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {task.nextStep || 'Pending assignee update.'}
              </p>
            </div>
            <span className="text-[10px] text-slate-500 mt-2 block">
              Planned next
            </span>
          </div>

          {/* Blocker */}
          <div
            className={`p-3 rounded-lg border flex flex-col justify-between ${
              task.status === 'BLOCKED'
                ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider">
                  Blocker
                </span>
                {task.status === 'BLOCKED' ? (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
              <p className="text-xs leading-relaxed">
                {task.status === 'BLOCKED' && task.blockedReason
                  ? task.blockedReason
                  : 'None'}
              </p>
            </div>
            <span className="text-[10px] text-slate-500 mt-2 block">
              {task.status === 'BLOCKED' ? 'Requires resolution' : 'No blocker'}
            </span>
          </div>
        </div>

        {/* Attachments (if any) */}
        {task.attachments && task.attachments.length > 0 && (
          <div>
            <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Attachments ({task.attachments.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {task.attachments.map((att) => (
                <div
                  key={att.id}
                  className="p-2.5 rounded-md bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <span className="text-slate-300 font-medium truncate">{att.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{att.size}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity & Updates Stream */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-3.5 h-3.5 text-blue-400" />
            <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Activity &amp; Updates
            </h4>
          </div>

          <div className="space-y-2.5">
            {historyUpdates.length === 0 && taskComments.length === 0 ? (
              <p className="text-xs text-slate-500">No activity recorded yet.</p>
            ) : (
              <>
                {historyUpdates.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Avatar name={item.userName} avatar={item.userAvatar} size="xs" />
                        <span className="font-semibold text-slate-200">{item.userName}</span>
                        <span className="text-slate-500">updated progress to</span>
                        <span className="font-mono text-blue-400 font-bold">
                          {item.progressPercentage}%
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                    {item.accomplished && (
                      <p className="text-slate-300 mt-1">
                        <span className="text-slate-500">Accomplished:</span> {item.accomplished}
                      </p>
                    )}
                    {item.nextStep && (
                      <p className="text-slate-400 mt-0.5">
                        <span className="text-slate-500">Next:</span> {item.nextStep}
                      </p>
                    )}
                    {item.isBlocked && item.blockedReason && (
                      <p className="text-rose-400 font-medium mt-1">
                        Blocker: {item.blockedReason}
                      </p>
                    )}
                  </div>
                ))}

                {taskComments.map((com) => (
                  <div
                    key={com.id}
                    className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Avatar name={com.userName} avatar={com.userAvatar} size="xs" />
                        <span className="font-semibold text-slate-200">{com.userName}</span>
                        <Badge variant="role" role={com.userRole} size="sm" />
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {formatRelativeTime(com.createdAt)}
                      </span>
                    </div>
                    <p className="text-slate-300 whitespace-pre-wrap">{com.content}</p>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Comment Form */}
          <form onSubmit={handleSendComment} className="mt-3 flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment or mention @team..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Comment</span>
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
};
