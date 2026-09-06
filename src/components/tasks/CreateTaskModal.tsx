import React, { useState } from 'react';
import { Plus, Calendar, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Priority, TaskStatus } from '../../types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose }) => {
  const { projects, createTask } = useData();
  const { allUsers, currentUser } = useAuth();

  if (currentUser.role !== 'ADMIN') {
    return null;
  }

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [assigneeId, setAssigneeId] = useState(allUsers[0]?.id || '');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [startDate, setStartDate] = useState('2026-09-04');
  const [dueDate, setDueDate] = useState('2026-09-11');
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState('2026-09-10');
  const [attachmentName, setAttachmentName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a task title.');
      return;
    }
    if (!projectId) {
      setError('Please select a project.');
      return;
    }
    if (!assigneeId) {
      setError('Please assign this task to a team member.');
      return;
    }

    const attachments = attachmentName.trim()
      ? [
          {
            id: `att-${Date.now()}`,
            name: attachmentName.trim(),
            size: '2.4 MB',
            url: '#',
            uploadedBy: currentUser.name,
            uploadedAt: new Date().toISOString(),
            type: 'file',
          },
        ]
      : [];

    createTask(
      {
        title: title.trim(),
        description: description.trim(),
        projectId,
        assigneeId,
        creatorId: currentUser.id,
        priority,
        status: 'NOT_STARTED',
        startDate,
        dueDate,
        estimatedCompletionDate,
      },
      attachments
    );

    // Reset and close
    setTitle('');
    setDescription('');
    setAttachmentName('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Task"
      subtitle="Assign work and set clear deadlines for automatic accountability"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        {error && (
          <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Task Title <span className="text-blue-400">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Build Vuew Dashboard & Metric Cards"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Project & Assignee */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Project <span className="text-blue-400">*</span>
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Assign To <span className="text-blue-400">*</span>
            </label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.jobTitle}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide context, acceptance criteria, and specific deliverables..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Priority & Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Est. Completion
            </label>
            <input
              type="date"
              value={estimatedCompletionDate}
              onChange={(e) => setEstimatedCompletionDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Optional Attachment */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Initial Attachment / Specification File (Optional)
          </label>
          <input
            type="text"
            value={attachmentName}
            onChange={(e) => setAttachmentName(e.target.value)}
            placeholder="e.g., architecture_spec_v1.pdf"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
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
            <Plus className="w-4 h-4" />
            <span>Create &amp; Notify Assignee</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
