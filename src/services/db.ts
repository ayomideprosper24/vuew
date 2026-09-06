import {
  User,
  Department,
  Project,
  Task,
  TaskUpdate,
  Comment,
  Notification,
  ActivityLog,
  SystemSettings,
  TaskStatus,
  HealthStatus
} from '../types';
import { calculateTaskHealth } from '../utils/helpers';

const STORAGE_KEYS = {
  USERS: 'vuew_users',
  DEPARTMENTS: 'vuew_departments',
  PROJECTS: 'vuew_projects',
  TASKS: 'vuew_tasks',
  TASK_UPDATES: 'vuew_task_updates',
  COMMENTS: 'vuew_comments',
  NOTIFICATIONS: 'vuew_notifications',
  ACTIVITY_LOGS: 'vuew_activity_logs',
  SETTINGS: 'vuew_settings',
  INITIALIZED: 'vuew_initialized_production_v2',
};

// Seed Data - Clean Production State
export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin',
    name: 'Ayomide Prosper',
    email: 'ayomideprosper24@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    role: 'ADMIN',
    departmentId: 'dept-eng',
    jobTitle: 'Executive Technology Lead',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    bio: 'Executive technology leader maintaining architectural hygiene and organizational execution velocity.',
    phone: '',
    pin: '1234',
  },
];

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'dept-eng', name: 'Engineering', description: 'Core software engineering, QA, DevOps and infrastructure', leadUserId: 'usr-admin', memberCount: 1 },
  { id: 'dept-prod', name: 'Product & UX', description: 'Product strategy, design systems, UX research and specifications', leadUserId: 'usr-admin', memberCount: 0 },
  { id: 'dept-ops', name: 'Internal Operations', description: 'People operations, legal, compliance, and administration', leadUserId: 'usr-admin', memberCount: 0 },
];

export const INITIAL_PROJECTS: Project[] = [];

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_TASK_UPDATES: TaskUpdate[] = [];

export const INITIAL_COMMENTS: Comment[] = [];

export const INITIAL_NOTIFICATIONS: Notification[] = [];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'act-1',
    userId: 'usr-admin',
    userName: 'Ayomide Prosper',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    action: 'initialized production workspace',
    objectType: 'USER',
    objectId: 'usr-admin',
    objectTitle: 'Ayomide Prosper',
    timestamp: new Date().toISOString(),
  },
];

export const INITIAL_SETTINGS: SystemSettings = {
  staleTaskThresholdDays: 3,
  atRiskDaysBeforeDeadline: 3,
  requireReviewForCompletion: true,
  emailNotificationsEnabled: true,
  slackWebhookUrl: '',
};

// Database Service Class with complete relational integrity
class DatabaseService {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error persisting to localStorage', e);
    }
  }

  public init(): void {
    if (localStorage.getItem(STORAGE_KEYS.INITIALIZED) !== 'vuew_initialized_production_v2') {
      this.resetToDefaults();
    }
  }

  public resetToDefaults(): void {
    this.set(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.set(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
    this.set(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    this.set(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    this.set(STORAGE_KEYS.TASK_UPDATES, INITIAL_TASK_UPDATES);
    this.set(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
    this.set(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    this.set(STORAGE_KEYS.ACTIVITY_LOGS, INITIAL_ACTIVITY_LOGS);
    this.set(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    this.set(STORAGE_KEYS.INITIALIZED, 'vuew_initialized_production_v2');
    localStorage.setItem('vuew_current_user_id', 'usr-admin');
  }

  // Users
  public getUsers(): User[] {
    const raw = this.get<any[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    // Sanitize in case old localStorage had obsolete roles or missing PIN
    const sanitized: User[] = raw.map((u) => {
      const role: 'ADMIN' | 'TEAM_MEMBER' = u.role === 'ADMIN' ? 'ADMIN' : 'TEAM_MEMBER';
      const pin: string = u.pin || (role === 'ADMIN' ? '1234' : '2024');
      return {
        ...u,
        role,
        pin,
      };
    });
    return sanitized;
  }

  public getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  public updateUser(updatedUser: User): void {
    const users = this.getUsers().map((u) => (u.id === updatedUser.id ? updatedUser : u));
    this.set(STORAGE_KEYS.USERS, users);
  }

  public setUserPin(userId: string, newPin: string): boolean {
    let user = this.getUserById(userId);
    if (!user && (userId === 'usr-admin' || userId === 'usr-5')) {
      const users = this.getUsers();
      user = users.find((u) => u.role === 'ADMIN');
    }
    if (!user) return false;
    this.updateUser({ ...user, pin: newPin.trim() });
    return true;
  }

  public addUser(user: User): void {
    const users = this.getUsers();
    this.set(STORAGE_KEYS.USERS, [...users, user]);
  }

  // Departments
  public getDepartments(): Department[] {
    return this.get<Department[]>(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
  }

  // Projects
  public getProjects(): Project[] {
    const projects = this.get<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const tasks = this.getTasks();

    // Dynamically calculate project overall progress and health from tasks
    return projects.map((p) => {
      const pTasks = tasks.filter((t) => t.projectId === p.id);
      if (pTasks.length === 0) return p;

      const totalProgress = pTasks.reduce((acc, t) => acc + t.progress, 0);
      const avgProgress = Math.round(totalProgress / pTasks.length);

      const hasAtRisk = pTasks.some((t) => t.health === 'AT_RISK');
      const hasNeedsAttention = pTasks.some((t) => t.health === 'NEEDS_ATTENTION');
      const health: HealthStatus = hasAtRisk ? 'AT_RISK' : hasNeedsAttention ? 'NEEDS_ATTENTION' : 'ON_TRACK';

      return {
        ...p,
        overallProgress: avgProgress,
        health,
      };
    });
  }

  public getProjectById(id: string): Project | undefined {
    return this.getProjects().find((p) => p.id === id);
  }

  public createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'overallProgress' | 'health'>, creator: User): Project {
    const projects = this.getProjects();
    const newProject: Project = {
      ...project,
      id: `proj-${Date.now()}`,
      overallProgress: 0,
      health: 'ON_TRACK',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    projects.unshift(newProject);
    this.set(STORAGE_KEYS.PROJECTS, projects);

    this.logActivity({
      userId: creator.id,
      userName: creator.name,
      userAvatar: creator.avatar,
      action: 'created project',
      objectType: 'PROJECT',
      objectId: newProject.id,
      objectTitle: newProject.name,
    });

    return newProject;
  }

  // Tasks
  public getTasks(): Task[] {
    const tasks = this.get<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    // Recalculate health real-time based on rules
    return tasks.map((t) => ({
      ...t,
      health: calculateTaskHealth(t),
    }));
  }

  public getTaskById(id: string): Task | undefined {
    const task = this.getTasks().find((t) => t.id === id);
    if (!task) return undefined;
    return {
      ...task,
      health: calculateTaskHealth(task),
    };
  }

  public createTask(
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'health' | 'attachments' | 'latestProgressUpdate' | 'nextStep' | 'blockedReason'>,
    creator: User,
    attachments: Task['attachments'] = []
  ): Task {
    const tasks = this.getTasks();
    const nextNum = tasks.length + 101;
    const newTask: Task = {
      ...taskData,
      id: `VUEW-${nextNum}`,
      progress: 0,
      health: 'ON_TRACK',
      attachments,
      latestProgressUpdate: 'Task created and ready to start.',
      nextStep: 'Begin initial research and implementation requirements.',
      blockedReason: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tasks.unshift(newTask);
    this.set(STORAGE_KEYS.TASKS, tasks);

    // Activity Log
    this.logActivity({
      userId: creator.id,
      userName: creator.name,
      userAvatar: creator.avatar,
      action: `created task and assigned to ${this.getUserById(newTask.assigneeId)?.name || 'team member'}`,
      objectType: 'TASK',
      objectId: newTask.id,
      objectTitle: newTask.title,
    });

    // Notify Assignee
    if (newTask.assigneeId !== creator.id) {
      this.createNotification({
        userId: newTask.assigneeId,
        title: `Task Assigned: ${newTask.id}`,
        message: `${creator.name} assigned you "${newTask.title}". Deadline: ${newTask.dueDate}`,
        type: 'TASK_ASSIGNED',
        taskId: newTask.id,
        projectId: newTask.projectId,
      });
    }

    return newTask;
  }

  // The 1-minute accountability progress update workflow
  public recordProgressUpdate(
    taskId: string,
    user: User,
    update: {
      progressPercentage: number;
      status: TaskStatus;
      accomplished: string;
      currentlyWorkingOn: string;
      nextStep: string;
      isBlocked: boolean;
      blockedReason?: string;
      estimatedCompletionDate: string;
      attachmentName?: string;
    }
  ): { task: Task; taskUpdate: TaskUpdate } {
    const tasks = this.getTasks();
    const index = tasks.findIndex((t) => t.id === taskId);
    if (index === -1) throw new Error('Task not found');

    const prevTask = tasks[index];
    const prevProgress = prevTask.progress;
    let newStatus = update.status;

    // RULE: If progress reaches 100%, change status to IN_REVIEW instead of auto-completing
    if (update.progressPercentage >= 100 && prevTask.status !== 'COMPLETED') {
      newStatus = 'IN_REVIEW';
    } else if (update.isBlocked) {
      newStatus = 'BLOCKED';
    }

    const updatedTask: Task = {
      ...prevTask,
      progress: update.progressPercentage,
      status: newStatus,
      estimatedCompletionDate: update.estimatedCompletionDate,
      latestProgressUpdate: update.accomplished || update.currentlyWorkingOn,
      nextStep: update.nextStep,
      blockedReason: update.isBlocked ? update.blockedReason || 'Blocked by external dependency' : '',
      updatedAt: new Date().toISOString(),
      health: 'ON_TRACK', // will be re-evaluated
    };

    updatedTask.health = calculateTaskHealth(updatedTask);
    tasks[index] = updatedTask;
    this.set(STORAGE_KEYS.TASKS, tasks);

    // Save individual history entry (do NOT overwrite)
    const newUpdate: TaskUpdate = {
      id: `upd-${Date.now()}`,
      taskId,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      progressPercentage: update.progressPercentage,
      status: newStatus,
      accomplished: update.accomplished,
      currentlyWorkingOn: update.currentlyWorkingOn,
      nextStep: update.nextStep,
      isBlocked: update.isBlocked,
      blockedReason: update.blockedReason,
      estimatedCompletionDate: update.estimatedCompletionDate,
      attachmentName: update.attachmentName,
      createdAt: new Date().toISOString(),
    };

    const updates = this.get<TaskUpdate[]>(STORAGE_KEYS.TASK_UPDATES, INITIAL_TASK_UPDATES);
    updates.unshift(newUpdate);
    this.set(STORAGE_KEYS.TASK_UPDATES, updates);

    // Log Activity
    const actionDesc =
      prevProgress !== update.progressPercentage
        ? `updated progress from ${prevProgress}% to ${update.progressPercentage}%`
        : update.isBlocked
        ? `marked task as BLOCKED: ${update.blockedReason || 'No reason specified'}`
        : `updated task status to ${newStatus}`;

    this.logActivity({
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      action: actionDesc,
      objectType: 'TASK',
      objectId: updatedTask.id,
      objectTitle: updatedTask.title,
    });

    // Notify Admins/Creator
    const project = this.getProjectById(updatedTask.projectId);
    const notifyUserIds = new Set<string>();
    if (updatedTask.creatorId && updatedTask.creatorId !== user.id) {
      notifyUserIds.add(updatedTask.creatorId);
    }
    if (project?.ownerId && project.ownerId !== user.id) {
      notifyUserIds.add(project.ownerId);
    }

    notifyUserIds.forEach((targetId) => {
      if (update.isBlocked) {
        this.createNotification({
          userId: targetId,
          title: `Task Blocked: ${updatedTask.id}`,
          message: `${user.name} reported a blocker on "${updatedTask.title}": ${update.blockedReason}`,
          type: 'TASK_BLOCKED',
          taskId: updatedTask.id,
          projectId: updatedTask.projectId,
        });
      } else if (newStatus === 'IN_REVIEW') {
        this.createNotification({
          userId: targetId,
          title: `Ready for Review: ${updatedTask.id}`,
          message: `${user.name} submitted "${updatedTask.title}" for review (100%).`,
          type: 'SUBMITTED_FOR_REVIEW',
          taskId: updatedTask.id,
          projectId: updatedTask.projectId,
        });
      } else {
        this.createNotification({
          userId: targetId,
          title: `Progress Update: ${updatedTask.id} (${update.progressPercentage}%)`,
          message: `${user.name} updated "${updatedTask.title}": ${update.accomplished || update.currentlyWorkingOn}`,
          type: 'PROGRESS_UPDATED',
          taskId: updatedTask.id,
          projectId: updatedTask.projectId,
        });
      }
    });

    return { task: updatedTask, taskUpdate: newUpdate };
  }

  // Admin Review: Approve or Request Changes
  public reviewTask(
    taskId: string,
    reviewer: User,
    decision: 'APPROVE' | 'REQUEST_CHANGES',
    feedback?: string
  ): Task {
    const tasks = this.getTasks();
    const index = tasks.findIndex((t) => t.id === taskId);
    if (index === -1) throw new Error('Task not found');

    const task = tasks[index];
    const newStatus: TaskStatus = decision === 'APPROVE' ? 'COMPLETED' : 'IN_PROGRESS';
    const now = new Date().toISOString();

    const updatedTask: Task = {
      ...task,
      status: newStatus,
      progress: decision === 'APPROVE' ? 100 : Math.min(task.progress, 85),
      actualCompletionDate: decision === 'APPROVE' ? now : undefined,
      reviewFeedback: feedback,
      updatedAt: now,
      latestProgressUpdate:
        decision === 'APPROVE'
          ? `Approved by ${reviewer.name}. Work completed.`
          : `Changes requested by ${reviewer.name}: "${feedback || 'Review requested changes'}"`,
    };

    tasks[index] = updatedTask;
    this.set(STORAGE_KEYS.TASKS, tasks);

    this.logActivity({
      userId: reviewer.id,
      userName: reviewer.name,
      userAvatar: reviewer.avatar,
      action: decision === 'APPROVE' ? 'approved task and marked completed' : 'requested changes on task',
      objectType: 'TASK',
      objectId: task.id,
      objectTitle: task.title,
    });

    // Notify Assignee
    if (task.assigneeId !== reviewer.id) {
      this.createNotification({
        userId: task.assigneeId,
        title: decision === 'APPROVE' ? `Task Approved: ${task.id}` : `Changes Requested: ${task.id}`,
        message:
          decision === 'APPROVE'
            ? `${reviewer.name} approved your work on "${task.title}".`
            : `${reviewer.name} requested changes: ${feedback || 'Please see details on task page.'}`,
        type: decision === 'APPROVE' ? 'TASK_APPROVED' : 'CHANGES_REQUESTED',
        taskId: task.id,
        projectId: task.projectId,
      });
    }

    return updatedTask;
  }

  // Task Updates History
  public getTaskUpdates(taskId?: string): TaskUpdate[] {
    const updates = this.get<TaskUpdate[]>(STORAGE_KEYS.TASK_UPDATES, INITIAL_TASK_UPDATES);
    if (!taskId) return updates;
    return updates.filter((u) => u.taskId === taskId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Comments
  public getComments(taskId?: string): Comment[] {
    const comments = this.get<Comment[]>(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
    if (!taskId) return comments;
    return comments.filter((c) => c.taskId === taskId);
  }

  public addComment(taskId: string, user: User, content: string, mentions: string[] = [], parentCommentId?: string): Comment {
    const comments = this.get<Comment[]>(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
    const newComment: Comment = {
      id: `com-${Date.now()}`,
      taskId,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      userRole: user.role,
      content,
      mentions,
      parentCommentId,
      createdAt: new Date().toISOString(),
    };

    comments.push(newComment);
    this.set(STORAGE_KEYS.COMMENTS, comments);

    const task = this.getTaskById(taskId);

    this.logActivity({
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      action: `commented on task`,
      objectType: 'TASK',
      objectId: taskId,
      objectTitle: task?.title || taskId,
    });

    // Notify mentioned users or task assignee
    if (task && task.assigneeId !== user.id) {
      this.createNotification({
        userId: task.assigneeId,
        title: `Comment on ${task.id}`,
        message: `${user.name}: "${content.slice(0, 90)}${content.length > 90 ? '...' : ''}"`,
        type: 'TASK_COMMENT',
        taskId: task.id,
        projectId: task.projectId,
      });
    }

    return newComment;
  }

  // Notifications
  public getNotifications(userId?: string): Notification[] {
    const notifs = this.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    if (!userId) return notifs;
    return notifs.filter((n) => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createNotification(notif: Omit<Notification, 'id' | 'read' | 'createdAt'>): Notification {
    const notifs = this.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const newNotif: Notification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    notifs.unshift(newNotif);
    this.set(STORAGE_KEYS.NOTIFICATIONS, notifs);
    return newNotif;
  }

  public markNotificationAsRead(id: string): void {
    const notifs = this.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const updated = notifs.map((n) => (n.id === id ? { ...n, read: true } : n));
    this.set(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  public markAllNotificationsAsRead(userId: string): void {
    const notifs = this.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const updated = notifs.map((n) => (n.userId === userId ? { ...n, read: true } : n));
    this.set(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  // Activity Logs
  public getActivityLogs(limit = 40): ActivityLog[] {
    const logs = this.get<ActivityLog[]>(STORAGE_KEYS.ACTIVITY_LOGS, INITIAL_ACTIVITY_LOGS);
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);
  }

  public logActivity(log: Omit<ActivityLog, 'id' | 'timestamp'>): void {
    const logs = this.get<ActivityLog[]>(STORAGE_KEYS.ACTIVITY_LOGS, INITIAL_ACTIVITY_LOGS);
    const newLog: ActivityLog = {
      ...log,
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    this.set(STORAGE_KEYS.ACTIVITY_LOGS, logs.slice(0, 150));
  }

  // Settings
  public getSettings(): SystemSettings {
    return this.get<SystemSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }

  public updateSettings(settings: Partial<SystemSettings>): SystemSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    this.set(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  }
}

export const db = new DatabaseService();
db.init();
