import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertOctagon, Upload, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useData } from '../../context/DataContext';
import { TaskStatus } from '../../types';

interface UpdateProgressModalProps {
  taskId: string | null;
  onClose: () => void;
}

export const UpdateProgressModal: React.FC<UpdateProgressModalProps> = ({ taskId, onClose }) => {
  const { tasks, recordProgressUpdate } = useData();

  const task = tasks.find((t) => t.id === taskId);

  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<TaskStatus>('IN_PROGRESS');
  const [accomplished, setAccomplished] = useState('');
  const [currentlyWorkingOn, setCurrentlyWorkingOn] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedReason, setBlockedReason] = useState('');
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setProgress(task.progress);
      setStatus(task.status);
      setEstimatedCompletionDate(task.estimatedCompletionDate || task.dueDate);
      setIsBlocked(task.status === 'BLOCKED');
      setBlockedReason(task.blockedReason || '');
      setAccomplished('');
      setCurrentlyWorkingOn(task.latestProgressUpdate || '');
      setNextStep(task.nextStep || '');
      setError('');
    }
  }, [task]);

  if (!task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accomplished.trim() && !currentlyWorkingOn.trim()) {
      setError('Please describe what you accomplished or what you are currently working on.');
      return;
    }

    if (isBlocked && !blockedReason.trim()) {
      setError('Please specify what is blocking your progress.');
      return;
    }

    recordProgressUpdate(task.id, {
      progressPercentage: progress,
      status: isBlocked ? 'BLOCKED' : progress >= 100 ? 'IN_REVIEW' : status,
      accomplished: accomplished.trim(),
      currentlyWorkingOn: currentlyWorkingOn.trim(),
      nextStep: nextStep.trim(),
      isBlocked,
      blockedReason: isBlocked ? blockedReason.trim() : '',
      estimatedCompletionDate,
      attachmentName: attachmentName ? attachmentName : undefined,
    });

    onClose();
  };

  const presetValues = [25, 50, 75, 90, 100];

  return (
    <Modal
      isOpen={!!taskId}
      onClose={onClose}
      title="Update Task Progress"
      subtitle={`${task.id} • ${task.title}`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-sm">
        {error && (
          <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Progress Percentage Slider & Presets */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Progress Percentage
            </label>
            <span className="font-mono text-xl font-black text-blue-400">{progress}%</span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />

          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-slate-500 mr-1">Presets:</span>
            {presetValues.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setProgress(val)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  progress === val
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                }`}
              >
                {val}%
              </button>
            ))}
          </div>

          {progress >= 100 && (
            <p className="text-xs text-purple-300 bg-purple-950/40 p-2.5 rounded-lg border border-purple-500/30 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span>
                Reaching 100% will automatically submit this task for <strong>Admin Review</strong>.
              </span>
            </p>
          )}
        </div>

        {/* 2. Status Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Current Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            disabled={isBlocked || progress >= 100}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 disabled:opacity-60"
          >
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="PAUSED">Paused</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </div>

        {/* 3. Accomplished */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            What did you accomplish? <span className="text-blue-400">*</span>
          </label>
          <textarea
            rows={2}
            value={accomplished}
            onChange={(e) => setAccomplished(e.target.value)}
            placeholder="e.g., Finished authentication middleware, wired user profile routes, wrote unit tests..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* 4. Currently working on */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            What are you currently working on?
          </label>
          <input
            type="text"
            value={currentlyWorkingOn}
            onChange={(e) => setCurrentlyWorkingOn(e.target.value)}
            placeholder="e.g., Connecting the database analytics charts and testing responsive mobile breakpoints"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* 5. Next step */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            What is your next step?
          </label>
          <input
            type="text"
            value={nextStep}
            onChange={(e) => setNextStep(e.target.value)}
            placeholder="e.g., Deploy to staging environment and request final QA sign-off"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* 6. Are you blocked? */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Are you blocked?</span>
              <span className="text-xs text-slate-400">
                Flag external dependencies, missing credentials, or pending reviews.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsBlocked(!isBlocked)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isBlocked ? 'bg-rose-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isBlocked ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {isBlocked && (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1">
                What is blocking you? <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={blockedReason}
                onChange={(e) => setBlockedReason(e.target.value)}
                placeholder="e.g., Awaiting Apple APNS credentials from IT Security..."
                className="w-full bg-slate-900 border border-rose-500/40 rounded-lg px-3 py-2 text-sm text-rose-200 placeholder-rose-700/60 focus:outline-none focus:border-rose-400"
              />
            </div>
          )}
        </div>

        {/* 7. Estimated Completion Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Estimated Completion Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={estimatedCompletionDate}
                onChange={(e) => setEstimatedCompletionDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Optional Attachment */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Attach File / Screenshot (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                value={attachmentName}
                onChange={(e) => setAttachmentName(e.target.value)}
                placeholder="e.g., staging-demo-recording.mp4"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Submit Progress Update</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
