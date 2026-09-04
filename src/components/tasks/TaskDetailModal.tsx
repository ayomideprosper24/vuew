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
  Sparkles,
  ChevronRight,
  History,
  FileText
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
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [showReviewInput, setShowReviewInput] = useState(false);

  const task = tasks.find((t) => t.id === taskId);
  if (!task) return null;

  const assignee = allUsers.find((u) => u.id === task.assigneeId);
  const creator = allUsers.find((u) => u.id === task.creatorId);
  const project = projects.find((p) => p.id === task.projectId);
  const historyUpdates = taskUpdates.filter((u) => u.taskId === task.id);
  const taskComments = comments.filter((c) => c.taskId === task.id);

  const isAllowedToUpdate = canUpdateProgress(task.assigneeId);
  const isAllowedToReview = canReviewTask;

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    // Detect @mentions
    const mentions: string[] = [];
    const mentionMatches = commentText.match(/@(\w+\s?\w*)/g);
    if (mentionMatches) {
      mentionMatches.forEach((m) => mentions.push(m.replace('@', '').trim()));
    }

    addComment(task.id, commentText.trim(), mentions, replyingToId || undefined);
    setCommentText('');
    setReplyingToId(null);
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
      subtitle={`${task.id} • ${project?.name || 'Project'}`}
      maxWidth="3xl"
    >
      <div className="space-y-6 text-sm">
        {/* Top Header Card with Meta Information */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Assigned to
            </span>
            <div className="flex items-center gap-2">
              <Avatar name={assignee?.name || 'Unassigned'} avatar={assignee?.avatar} size="xs" />
              <span className="text-xs font-semibold text-slate-200 truncate">
                {assignee?.name || 'Unassigned'}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Priority
            </span>
            <Badge variant="priority" priority={task.priority} size="sm" />
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Status
            </span>
            <Badge variant="status" status={task.status} size="sm" />
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Due Date
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-200 font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          </div>
        </div>

        {/* Manager Review Action Banner (When task reaches 100% or IN_REVIEW) */}
        {task.status === 'IN_REVIEW' && (
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <div>
                  <h4 className="text-sm font-bold text-white">Work Submitted for Review (100%)</h4>
                  <p className="text-xs text-purple-300">
                    Awaiting manager review before officially marking as Completed.
                  </p>
                </div>
              </div>

              {isAllowedToReview && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleApprove}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => setShowReviewInput(!showReviewInput)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Request Changes
                  </button>
                </div>
              )}
            </div>

            {showReviewInput && (
              <div className="pt-2 border-t border-purple-500/20 space-y-2">
                <label className="text-xs font-medium text-slate-300 block">
                  Provide feedback on what needs to be changed:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={reviewFeedback}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                    placeholder="e.g., Please write unit tests for edge cases..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={handleRequestChanges}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"
                  >
                    Send Feedback
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Task Review Feedback note if requested previously */}
        {task.reviewFeedback && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
            <strong>Manager Feedback:</strong> &ldquo;{task.reviewFeedback}&rdquo;
          </div>
        )}

        {/* Large Visual Progress Bar */}
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              PROGRESS
            </span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl font-black text-blue-400">{task.progress}%</span>
              {isAllowedToUpdate && task.status !== 'COMPLETED' && (
                <button
                  onClick={() => {
                    onClose();
                    setProgressUpdateTaskId(task.id);
                  }}
                  className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                >
                  Update Progress
                </button>
              )}
            </div>
          </div>
          <ProgressBar
            progress={task.progress}
            status={task.status}
            health={task.health}
            height="lg"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
            <span>Started: {formatDate(task.startDate)}</span>
            <span>Est. Completion: {formatDate(task.estimatedCompletionDate)}</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Description
          </h4>
          <p className="text-slate-300 text-xs leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
            {task.description}
          </p>
        </div>

        {/* Three Pillars: Latest Update, Next Step, Blocker */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* LATEST UPDATE */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                LATEST UPDATE
              </span>
              <p className="text-xs text-slate-200 leading-relaxed italic">
                {task.latestProgressUpdate
                  ? `"${task.latestProgressUpdate}"`
                  : 'No updates logged yet.'}
              </p>
            </div>
            <span className="text-[10px] text-slate-400 mt-3 block font-mono">
              Updated: {formatRelativeTime(task.updatedAt)}
            </span>
          </div>

          {/* NEXT STEP */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                NEXT STEP
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {task.nextStep ? `"${task.nextStep}"` : 'Pending assignee update.'}
              </p>
            </div>
            <span className="text-[10px] text-blue-400 mt-3 block flex items-center gap-1">
              Active Milestone <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          {/* BLOCKER */}
          <div
            className={`p-3.5 rounded-xl border flex flex-col justify-between ${
              task.status === 'BLOCKED'
                ? 'bg-rose-950/25 border-rose-500/40 text-rose-300'
                : 'bg-slate-950/80 border-slate-800 text-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider">BLOCKER</span>
                {task.status === 'BLOCKED' ? (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <p className="text-xs leading-relaxed">
                {task.status === 'BLOCKED' && task.blockedReason ? (
                  <span className="font-medium text-rose-200">{task.blockedReason}</span>
                ) : (
                  <span className="text-emerald-400 font-medium">No blocker.</span>
                )}
              </p>
            </div>
            <span className="text-[10px] text-slate-400 mt-3 block">
              {task.status === 'BLOCKED' ? 'Needs triage' : 'Clear runway'}
            </span>
          </div>
        </div>

        {/* Attachments Section if present */}
        {task.attachments.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              ATTACHMENTS ({task.attachments.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {task.attachments.map((att) => (
                <div
                  key={att.id}
                  className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <div className="truncate">
                      <p className="text-slate-200 font-medium truncate">{att.name}</p>
                      <p className="text-[10px] text-slate-400">{att.size}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">{formatRelativeTime(att.uploadedAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTIVITY TIMELINE (Immutable accountability history) */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-blue-400" />
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              ACTIVITY TIMELINE &amp; AUDIT LOG
            </h4>
          </div>

          <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-800">
            {historyUpdates.length === 0 ? (
              <p className="text-xs text-slate-500 pl-8">No historical progress logs yet.</p>
            ) : (
              historyUpdates.map((item) => (
                <div key={item.id} className="relative flex items-start gap-3 pl-8">
                  <div className="absolute left-1.5 top-1 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-blue-500 flex-shrink-0" />
                  <div className="flex-1 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <Avatar name={item.userName} avatar={item.userAvatar} size="xs" />
                        <span className="font-semibold text-slate-200">{item.userName}</span>
                        <span className="font-mono text-blue-400 font-bold ml-1">
                          {item.progressPercentage}%
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">{formatDate(item.createdAt)}</span>
                    </div>
                    {item.accomplished && (
                      <p className="text-slate-300 mb-1 leading-relaxed">
                        <strong>Accomplished:</strong> {item.accomplished}
                      </p>
                    )}
                    {item.nextStep && (
                      <p className="text-slate-400 leading-relaxed">
                        <strong>Next:</strong> {item.nextStep}
                      </p>
                    )}
                    {item.isBlocked && item.blockedReason && (
                      <p className="text-rose-400 font-medium mt-1">
                        <strong>Blocker:</strong> {item.blockedReason}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COMMENTS SECTION (Threaded with @ mentions) */}
        <div className="pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              DISCUSSION &amp; CLARIFICATIONS ({taskComments.length})
            </h4>
          </div>

          <div className="space-y-3 mb-4">
            {taskComments.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No comments yet. Keep discussions inside the task.</p>
            ) : (
              taskComments.map((com) => (
                <div key={com.id} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Avatar name={com.userName} avatar={com.userAvatar} size="xs" />
                      <span className="font-semibold text-slate-200">{com.userName}</span>
                      <Badge variant="role" role={com.userRole} size="sm" />
                    </div>
                    <span className="text-[10px] text-slate-400">{formatRelativeTime(com.createdAt)}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{com.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Add Comment Input Form */}
          <form onSubmit={handleSendComment} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment or mention someone with @ (e.g. @Sarah)..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
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
