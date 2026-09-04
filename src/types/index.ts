export type Role = 'ADMIN' | 'TEAM_MEMBER';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TaskStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'BLOCKED'
  | 'IN_REVIEW'
  | 'COMPLETED'
  | 'PAUSED'
  | 'CANCELLED';

export type ProjectStatus =
  | 'PLANNING'
  | 'ACTIVE'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CANCELLED';

export type HealthStatus = 'ON_TRACK' | 'NEEDS_ATTENTION' | 'AT_RISK';
export type TaskHealth = HealthStatus;

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  departmentId: string;
  jobTitle: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  lastActive: string;
  bio?: string;
  phone?: string;
  pin: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  leadUserId: string;
  memberCount: number;
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  type: string;
}

export interface TaskUpdate {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  progressPercentage: number;
  status: TaskStatus;
  accomplished: string;
  currentlyWorkingOn: string;
  nextStep: string;
  isBlocked: boolean;
  blockedReason?: string;
  estimatedCompletionDate: string;
  attachmentName?: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole: Role;
  content: string;
  mentions: string[];
  parentCommentId?: string;
  createdAt: string;
}

export interface Task {
  id: string; // e.g., 'VUEW-101'
  title: string;
  description: string;
  projectId: string;
  assigneeId: string;
  creatorId: string;
  priority: Priority;
  status: TaskStatus;
  progress: number; // 0 to 100
  startDate: string;
  dueDate: string;
  estimatedCompletionDate: string;
  actualCompletionDate?: string;
  createdAt: string;
  updatedAt: string;
  latestProgressUpdate?: string;
  nextStep?: string;
  blockedReason?: string;
  attachments: Attachment[];
  health: HealthStatus;
  reviewFeedback?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  teamMemberIds: string[];
  startDate: string;
  deadline: string;
  status: ProjectStatus;
  overallProgress: number;
  health: HealthStatus;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_REASSIGNED'
  | 'DEADLINE_APPROACHING'
  | 'TASK_COMMENT'
  | 'CHANGES_REQUESTED'
  | 'TASK_APPROVED'
  | 'TASK_OVERDUE'
  | 'TASK_BLOCKED'
  | 'PROGRESS_UPDATED'
  | 'SUBMITTED_FOR_REVIEW'
  | 'TASK_STALE';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  taskId?: string;
  projectId?: string;
  read: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: string;
  objectType: 'TASK' | 'PROJECT' | 'USER' | 'COMMENT';
  objectId: string;
  objectTitle: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface SystemSettings {
  staleTaskThresholdDays: number;
  atRiskDaysBeforeDeadline: number;
  requireReviewForCompletion: boolean;
  emailNotificationsEnabled: boolean;
  slackWebhookUrl?: string;
}
