import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Task,
  Project,
  Department,
  TaskUpdate,
  Comment,
  Notification,
  ActivityLog,
  SystemSettings,
  TaskStatus,
} from '../types';
import { db } from '../services/db';
import { useAuth } from './AuthContext';
import {
  pullFromSupabase,
  pushToSupabase,
  clearAndLinkToSupabase,
  syncTaskToSupabase,
  syncTaskUpdateToSupabase,
  syncProjectToSupabase,
  subscribeToSyncEvents,
  setupSupabaseRealtime,
} from '../services/supabaseSync';
import { getSupabaseConfig } from '../services/supabase';

interface DataContextType {
  tasks: Task[];
  projects: Project[];
  departments: Department[];
  taskUpdates: TaskUpdate[];
  comments: Comment[];
  notifications: Notification[];
  activityLogs: ActivityLog[];
  settings: SystemSettings;
  unreadNotificationCount: number;
  isSupabaseConfigured: boolean;

  // Modals & Navigation state
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  progressUpdateTaskId: string | null;
  setProgressUpdateTaskId: (id: string | null) => void;
  reviewTaskId: string | null;
  setReviewTaskId: (id: string | null) => void;
  createTaskModalOpen: boolean;
  setCreateTaskModalOpen: (open: boolean) => void;
  createProjectModalOpen: boolean;
  setCreateProjectModalOpen: (open: boolean) => void;
  globalSearchOpen: boolean;
  setGlobalSearchOpen: (open: boolean) => void;

  // Actions
  refreshData: () => void;
  syncWithSupabase: () => Promise<{ success: boolean; message: string }>;
  clearAndLinkSupabase: () => Promise<{ success: boolean; message: string }>;
  createTask: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'health' | 'attachments' | 'latestProgressUpdate' | 'nextStep' | 'blockedReason'>, attachments?: Task['attachments']) => Task;
  recordProgressUpdate: (taskId: string, update: {
    progressPercentage: number;
    status: TaskStatus;
    accomplished: string;
    currentlyWorkingOn: string;
    nextStep: string;
    isBlocked: boolean;
    blockedReason?: string;
    estimatedCompletionDate: string;
    attachmentName?: string;
  }) => void;
  reviewTask: (taskId: string, decision: 'APPROVE' | 'REQUEST_CHANGES', feedback?: string) => void;
  createProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'overallProgress' | 'health'>) => Project;
  addComment: (taskId: string, content: string, mentions?: string[], parentCommentId?: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  resetDemoData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, refreshUsers } = useAuth();

  const [tasks, setTasks] = useState<Task[]>(() => db.getTasks());
  const [projects, setProjects] = useState<Project[]>(() => db.getProjects());
  const [departments, setDepartments] = useState<Department[]>(() => db.getDepartments());
  const [taskUpdates, setTaskUpdates] = useState<TaskUpdate[]>(() => db.getTaskUpdates());
  const [comments, setComments] = useState<Comment[]>(() => db.getComments());
  const [notifications, setNotifications] = useState<Notification[]>(() => db.getNotifications(currentUser.id));
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => db.getActivityLogs());
  const [settings, setSettings] = useState<SystemSettings>(() => db.getSettings());
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState<boolean>(() => getSupabaseConfig().isConfigured);

  // Modal states
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [progressUpdateTaskId, setProgressUpdateTaskId] = useState<string | null>(null);
  const [reviewTaskId, setReviewTaskId] = useState<string | null>(null);
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState<boolean>(false);
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState<boolean>(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState<boolean>(false);

  const refreshData = useCallback(() => {
    setTasks(db.getTasks());
    setProjects(db.getProjects());
    setDepartments(db.getDepartments());
    setTaskUpdates(db.getTaskUpdates());
    setComments(db.getComments());
    setNotifications(db.getNotifications(currentUser.id));
    setActivityLogs(db.getActivityLogs());
    setSettings(db.getSettings());
    setIsSupabaseConfigured(getSupabaseConfig().isConfigured);
  }, [currentUser.id]);

  useEffect(() => {
    refreshData();
  }, [currentUser.id, refreshData]);

  // Initial pull and realtime subscriptions when Supabase is configured
  useEffect(() => {
    const config = getSupabaseConfig();
    setIsSupabaseConfigured(config.isConfigured);

    if (config.isConfigured) {
      pullFromSupabase().then((res) => {
        if (res.success) {
          refreshData();
          refreshUsers();
        }
      });
    }

    const unsubscribeSync = subscribeToSyncEvents(() => {
      refreshData();
      refreshUsers();
    });

    const unsubscribeRealtime = setupSupabaseRealtime(() => {
      refreshData();
      refreshUsers();
    });

    // Auto-refresh when tab gains focus or on interval
    const handleFocus = () => {
      if (getSupabaseConfig().isConfigured) {
        pullFromSupabase().then((res) => {
          if (res.success) {
            refreshData();
            refreshUsers();
          }
        });
      }
    };
    window.addEventListener('focus', handleFocus);

    const intervalId = setInterval(() => {
      if (getSupabaseConfig().isConfigured && document.visibilityState === 'visible') {
        pullFromSupabase().then((res) => {
          if (res.success) {
            refreshData();
            refreshUsers();
          }
        });
      }
    }, 20000);

    return () => {
      unsubscribeSync();
      unsubscribeRealtime();
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, [refreshData, refreshUsers]);

  const syncWithSupabase = async () => {
    const res = await pullFromSupabase();
    if (res.success) {
      refreshData();
      refreshUsers();
    }
    return res;
  };

  const clearAndLinkSupabase = async () => {
    const res = await clearAndLinkToSupabase();
    refreshData();
    refreshUsers();
    return res;
  };

  const createTask = (
    data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'health' | 'attachments' | 'latestProgressUpdate' | 'nextStep' | 'blockedReason'>,
    attachments: Task['attachments'] = []
  ) => {
    const newTask = db.createTask(data, currentUser, attachments);
    refreshData();
    syncTaskToSupabase(newTask);
    return newTask;
  };

  const recordProgressUpdate = (
    taskId: string,
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
  ) => {
    const res = db.recordProgressUpdate(taskId, currentUser, update);
    refreshData();
    if (res?.taskUpdate) {
      syncTaskUpdateToSupabase(res.taskUpdate);
    }
    const updatedTask = db.getTaskById(taskId);
    if (updatedTask) {
      syncTaskToSupabase(updatedTask);
    }
  };

  const reviewTask = (taskId: string, decision: 'APPROVE' | 'REQUEST_CHANGES', feedback?: string) => {
    db.reviewTask(taskId, currentUser, decision, feedback);
    refreshData();
    const updatedTask = db.getTaskById(taskId);
    if (updatedTask) {
      syncTaskToSupabase(updatedTask);
    }
  };

  const createProject = (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'overallProgress' | 'health'>) => {
    const newProj = db.createProject(data, currentUser);
    refreshData();
    syncProjectToSupabase(newProj);
    pushToSupabase();
    return newProj;
  };

  const addComment = (taskId: string, content: string, mentions: string[] = [], parentCommentId?: string) => {
    db.addComment(taskId, currentUser, content, mentions, parentCommentId);
    refreshData();
  };

  const markNotificationRead = (id: string) => {
    db.markNotificationAsRead(id);
    refreshData();
  };

  const markAllNotificationsRead = () => {
    db.markAllNotificationsAsRead(currentUser.id);
    refreshData();
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    db.updateSettings(newSettings);
    refreshData();
  };

  const resetDemoData = () => {
    db.resetToDefaults();
    refreshData();
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  return (
    <DataContext.Provider
      value={{
        tasks,
        projects,
        departments,
        taskUpdates,
        comments,
        notifications,
        activityLogs,
        settings,
        unreadNotificationCount,
        isSupabaseConfigured,
        selectedTaskId,
        setSelectedTaskId,
        progressUpdateTaskId,
        setProgressUpdateTaskId,
        reviewTaskId,
        setReviewTaskId,
        createTaskModalOpen,
        setCreateTaskModalOpen,
        createProjectModalOpen,
        setCreateProjectModalOpen,
        globalSearchOpen,
        setGlobalSearchOpen,
        refreshData,
        syncWithSupabase,
        clearAndLinkSupabase,
        createTask,
        recordProgressUpdate,
        reviewTask,
        createProject,
        addComment,
        markNotificationRead,
        markAllNotificationsRead,
        updateSettings,
        resetDemoData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

