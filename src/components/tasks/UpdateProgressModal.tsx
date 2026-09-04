import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertOctagon } from 'lucide-react';
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
  const [nextStep, setNextStep] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedReason, setBlockedReason] = useState('');
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setProgress(task.progress);
      setStatus(task.status);
      setEstimatedCompletionDate(task.estimatedCompletionDate || task.dueDate);
      setIsBlocked(task.status === 'BLOCKED');
      setBlockedReason(task.blockedReason || '');
      setAccomplished(task.latestProgressUpdate || '');
      setNextStep(task.nextStep || '');
      setError('');
    }
  }, [task]);

  if (!task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accomplished.trim()) {
      setError('Please provide a brief note on what was completed.');
      return;
    }

    if (isBlocked && !blockedReason.trim()) {
      setError('Please specify the blocker reason.');
      return;
    }

    recordProgressUpdate(task.id, {
      progressPercentage: progress,
      status: isBlocked ? 'BLOCKED' : progress >= 100 ? 'IN_REVIEW' : status,
      accomplished: accomplished.trim(),
      currentlyWorkingOn: '',
      nextStep: nextStep.trim(),
      isBlocked,
      blockedReason: isBlocked ? blockedReason.trim() : '',
      estimatedCompletionDate,
    });

    onClose();
  };

  const presetValues = [25, 50, 75, 100];

  return (
    <Modal
      isOpen={!!taskId}
      onClose={onClose}
      title="Update Progress"
      subtitle={`${task.id} • ${task.title}`}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        {error && (
          <div className="p-2.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Progress Percentage */}
        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Progress
            </label>
            <span className="font-mono text-lg font-bold text-blue-400">{progress}%</span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />

          <div className="flex items-center gap-2">
            {presetValues.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setProgress(val)}
                className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  progress === val
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {val}%
              </button>
            ))}
          </div>

          {progress >= 100 && (
            <p className="text-[11px] text-blue-300 pt-1">
              Note: 100% completion submits task for review.
            </p>
          )}
        </div>

        {/* What was completed */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            What did you complete? <span className="text-blue-400">*</span>
          </label>
          <textarea
            rows={2}
            value={accomplished}
            onChange={(e) => setAccomplished(e.target.value)}
            placeholder="Brief summary of work completed..."
            className="w-full bg-slate-950 border border-slate-800 rounded-md p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* What is next step */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            What is the next step?
          </label>
          <input
            type="text"
            value={nextStep}
            onChange={(e) => setNextStep(e.target.value)}
            placeholder="Next milestone or deliverable..."
            className="w-full bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Blocker toggle */}
        <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Is there a blocker?</span>
              <span className="text-[11px] text-slate-500">
                Flag if external dependencies or approvals are blocking work.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsBlocked(!isBlocked)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                isBlocked ? 'bg-rose-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  isBlocked ? 'translate-x-4.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {isBlocked && (
            <div className="pt-1.5">
              <input
                type="text"
                value={blockedReason}
                onChange={(e) => setBlockedReason(e.target.value)}
                placeholder="Describe blocker reason..."
                className="w-full bg-slate-900 border border-rose-500/40 rounded-md px-2.5 py-1.5 text-xs text-rose-200 placeholder-rose-400/50 focus:outline-none focus:border-rose-400"
              />
            </div>
          )}
        </div>

        {/* Estimated Completion Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Estimated Completion Date
          </label>
          <input
            type="date"
            value={estimatedCompletionDate}
            onChange={(e) => setEstimatedCompletionDate(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Submit Update</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
