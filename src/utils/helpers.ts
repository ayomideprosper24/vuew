import { Task, HealthStatus, Priority, TaskStatus } from '../types';

export function calculateTaskHealth(task: Partial<Task>): HealthStatus {
  if (task.status === 'COMPLETED') return 'ON_TRACK';
  if (task.status === 'CANCELLED') return 'ON_TRACK';
  
  const now = new Date('2026-09-04T14:39:36Z').getTime(); // Current system reference time
  const dueDate = task.dueDate ? new Date(task.dueDate).getTime() : now;
  const estimatedDate = task.estimatedCompletionDate ? new Date(task.estimatedCompletionDate).getTime() : dueDate;
  const lastUpdated = task.updatedAt ? new Date(task.updatedAt).getTime() : now;
  
  const daysUntilDue = (dueDate - now) / (1000 * 60 * 60 * 24);
  const daysSinceUpdate = (now - lastUpdated) / (1000 * 60 * 60 * 24);
  const progress = task.progress ?? 0;

  // 1. Definite At Risk criteria
  if (task.status === 'BLOCKED') return 'AT_RISK';
  if (daysUntilDue < 0) return 'AT_RISK'; // Overdue
  if (estimatedDate > dueDate) return 'AT_RISK'; // Estimated after deadline
  if (daysUntilDue <= 3 && progress < 40) return 'AT_RISK';
  if (daysSinceUpdate > 4 && task.status === 'IN_PROGRESS') return 'AT_RISK'; // Stale in-progress task

  // 2. Needs Attention criteria
  if (daysUntilDue <= 5 && progress < 60) return 'NEEDS_ATTENTION';
  if (daysSinceUpdate > 2 && task.status === 'IN_PROGRESS') return 'NEEDS_ATTENTION';
  if (task.status === 'PAUSED') return 'NEEDS_ATTENTION';
  if (task.status === 'IN_REVIEW' && daysSinceUpdate > 2) return 'NEEDS_ATTENTION';

  // 3. On Track
  return 'ON_TRACK';
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'Not set';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'recently';
  try {
    const d = new Date(dateString).getTime();
    const now = new Date('2026-09-04T14:39:36Z').getTime();
    const diffSeconds = Math.floor((now - d) / 1000);

    if (diffSeconds < 60) return 'just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  } catch {
    return dateString;
  }
}

export function getDaysRemaining(dueDateString?: string): { days: number; text: string; isOverdue: boolean } {
  if (!dueDateString) return { days: 0, text: 'No deadline', isOverdue: false };
  const now = new Date('2026-09-04T14:39:36Z').getTime();
  const due = new Date(dueDateString).getTime();
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { days: Math.abs(diffDays), text: `${Math.abs(diffDays)}d overdue`, isOverdue: true };
  } else if (diffDays === 0) {
    return { days: 0, text: 'Due today', isOverdue: false };
  } else if (diffDays === 1) {
    return { days: 1, text: 'Due tomorrow', isOverdue: false };
  } else {
    return { days: diffDays, text: `${diffDays}d left`, isOverdue: false };
  }
}

export function getPriorityColor(priority: Priority): { bg: string; text: string; border: string; dot: string } {
  switch (priority) {
    case 'URGENT':
      return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', dot: 'bg-rose-500' };
    case 'HIGH':
      return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-500' };
    case 'MEDIUM':
      return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', dot: 'bg-blue-500' };
    case 'LOW':
    default:
      return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30', dot: 'bg-slate-400' };
  }
}

export function getStatusColor(status: TaskStatus): { bg: string; text: string; border: string; label: string } {
  switch (status) {
    case 'NOT_STARTED':
      return { bg: 'bg-slate-500/10', text: 'text-slate-300', border: 'border-slate-500/30', label: 'Not Started' };
    case 'IN_PROGRESS':
      return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', label: 'In Progress' };
    case 'BLOCKED':
      return { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/40', label: 'Blocked' };
    case 'IN_REVIEW':
      return { bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/30', label: 'In Review' };
    case 'COMPLETED':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Completed' };
    case 'PAUSED':
      return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Paused' };
    case 'CANCELLED':
      return { bg: 'bg-slate-700/20', text: 'text-slate-500', border: 'border-slate-700/40', label: 'Cancelled' };
    default:
      return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30', label: status };
  }
}

export function getHealthDetails(health: HealthStatus): { label: string; text: string; bg: string; border: string; color: string } {
  switch (health) {
    case 'ON_TRACK':
      return { label: 'On Track', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', color: '#10b981' };
    case 'NEEDS_ATTENTION':
      return { label: 'Needs Attention', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', color: '#f59e0b' };
    case 'AT_RISK':
      return { label: 'At Risk', text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', color: '#f43f5e' };
  }
}
