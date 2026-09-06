import { getSupabaseClient, getSupabaseConfig } from './supabase';
import { db } from './db';
import { Task, Project, TaskUpdate, Notification, ActivityLog, User } from '../types';

export interface SyncStatus {
  isConfigured: boolean;
  isConnected: boolean;
  lastSyncedAt?: string;
  inProgress: boolean;
  error?: string;
  source: 'LOCAL' | 'SUPABASE';
}

type SyncCallback = () => void;
const listeners = new Set<SyncCallback>();

export function subscribeToSyncEvents(callback: SyncCallback): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function notifyListeners() {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.error('Error in sync listener:', e);
    }
  });
}

/**
 * Pull all data from Supabase and update the local database cache.
 */
export async function pullFromSupabase(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase is not configured yet. Add your Project URL & Anon Key.' };
  }

  try {
    // 1. Fetch Profiles / Users
    const { data: profiles, error: pErr } = await client.from('profiles').select('*');
    if (pErr) throw new Error(`Profiles fetch failed: ${pErr.message}`);

    if (profiles && profiles.length > 0) {
      const mappedUsers: User[] = profiles.map((p: any) => ({
        id: p.id,
        name: p.name || 'Team Member',
        email: p.email || '',
        avatar: p.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        role: p.role || 'TEAM_MEMBER',
        departmentId: p.department_id || 'dept-eng',
        jobTitle: p.job_title || 'Software Engineer',
        status: 'ACTIVE',
        createdAt: p.created_at || new Date().toISOString(),
        lastActive: new Date().toISOString(),
        pin: p.pin || '1234',
      }));
      localStorage.setItem('vuew_users', JSON.stringify(mappedUsers));
    }

    // 2. Fetch Projects
    const { data: projects, error: prErr } = await client.from('projects').select('*');
    if (prErr) throw new Error(`Projects fetch failed: ${prErr.message}`);

    if (projects) {
      const mappedProjects: Project[] = projects.map((pr: any) => ({
        id: pr.id,
        name: pr.name,
        description: pr.description || '',
        ownerId: pr.owner_id || 'usr-5',
        teamMemberIds: pr.team_member_ids || pr.member_ids || [],
        startDate: pr.start_date || pr.created_at || new Date().toISOString(),
        deadline: pr.deadline || pr.due_date || new Date(Date.now() + 86400000 * 30).toISOString(),
        status: pr.status || 'ACTIVE',
        overallProgress: pr.overall_progress || 0,
        health: pr.health || 'ON_TRACK',
        createdAt: pr.created_at || new Date().toISOString(),
        updatedAt: pr.updated_at || new Date().toISOString(),
      }));
      localStorage.setItem('vuew_projects', JSON.stringify(mappedProjects));
    }

    // 3. Fetch Tasks
    const { data: tasks, error: tErr } = await client.from('tasks').select('*');
    if (tErr) throw new Error(`Tasks fetch failed: ${tErr.message}`);

    if (tasks) {
      const mappedTasks: Task[] = tasks.map((t: any) => ({
        id: t.id,
        projectId: t.project_id,
        title: t.title,
        description: t.description || '',
        assigneeId: t.assignee_id || '',
        creatorId: t.creator_id || 'usr-5',
        status: t.status || 'NOT_STARTED',
        priority: t.priority || 'MEDIUM',
        progress: t.progress || 0,
        startDate: t.start_date || t.created_at || new Date().toISOString(),
        dueDate: t.due_date || new Date().toISOString(),
        estimatedCompletionDate: t.estimated_completion_date || t.due_date || new Date().toISOString(),
        actualCompletionDate: t.actual_completion_date,
        createdAt: t.created_at || new Date().toISOString(),
        updatedAt: t.updated_at || new Date().toISOString(),
        latestProgressUpdate: t.latest_progress_update,
        nextStep: t.next_step,
        blockedReason: t.blocked_reason,
        attachments: t.attachments || [],
        health: t.health || 'ON_TRACK',
      }));
      localStorage.setItem('vuew_tasks', JSON.stringify(mappedTasks));
    }

    // 4. Fetch Task Updates
    const { data: updates, error: uErr } = await client.from('task_updates').select('*');
    if (!uErr && updates) {
      const mappedUpdates: TaskUpdate[] = updates.map((u: any) => ({
        id: u.id,
        taskId: u.task_id,
        userId: u.user_id || u.author_id,
        userName: u.user_name || 'Team Member',
        userAvatar: u.user_avatar || '',
        progressPercentage: u.progress_percentage || u.progress || 0,
        status: u.status || 'IN_PROGRESS',
        accomplished: u.accomplished || '',
        currentlyWorkingOn: u.currently_working_on || '',
        nextStep: u.next_step || '',
        isBlocked: !!u.is_blocked,
        blockedReason: u.blocker_reason || u.blocked_reason,
        estimatedCompletionDate: u.estimated_completion_date || new Date().toISOString(),
        createdAt: u.created_at || new Date().toISOString(),
      }));
      localStorage.setItem('vuew_task_updates', JSON.stringify(mappedUpdates));
    }

    notifyListeners();
    return {
      success: true,
      message: `Successfully synchronized from Supabase (${profiles?.length || 0} users, ${projects?.length || 0} projects, ${tasks?.length || 0} tasks).`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Supabase pull error:', err);
    return { success: false, message: msg };
  }
}

/**
 * Pushes all current workspace items to Supabase
 */
export async function pushToSupabase(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase credentials are required.' };
  }

  try {
    const users = db.getUsers();
    const projects = db.getProjects();
    const tasks = db.getTasks();
    const updates = db.getTaskUpdates();

    // 1. Profiles
    if (users.length > 0) {
      const profilesPayload = users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        job_title: u.jobTitle,
        avatar: u.avatar,
        pin: u.pin,
        department_id: u.departmentId,
      }));
      const { error: pErr } = await client.from('profiles').upsert(profilesPayload, { onConflict: 'id' });
      if (pErr) throw new Error(`Profiles sync failed: ${pErr.message}`);
    }

    // 2. Projects
    if (projects.length > 0) {
      const projectsPayload = projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        owner_id: p.ownerId,
        team_member_ids: p.teamMemberIds,
        start_date: p.startDate,
        deadline: p.deadline,
        status: p.status,
        overall_progress: p.overallProgress,
        health: p.health,
      }));
      const { error: prErr } = await client.from('projects').upsert(projectsPayload, { onConflict: 'id' });
      if (prErr) throw new Error(`Projects sync failed: ${prErr.message}`);
    }

    // 3. Tasks
    if (tasks.length > 0) {
      const tasksPayload = tasks.map((t) => ({
        id: t.id,
        project_id: t.projectId,
        title: t.title,
        description: t.description,
        assignee_id: t.assigneeId,
        creator_id: t.creatorId,
        status: t.status,
        priority: t.priority,
        progress: t.progress,
        start_date: t.startDate,
        due_date: t.dueDate,
        estimated_completion_date: t.estimatedCompletionDate,
        latest_progress_update: t.latestProgressUpdate,
        next_step: t.nextStep,
        blocked_reason: t.blockedReason,
        health: t.health,
      }));
      const { error: tErr } = await client.from('tasks').upsert(tasksPayload, { onConflict: 'id' });
      if (tErr) throw new Error(`Tasks sync failed: ${tErr.message}`);
    }

    // 4. Updates
    if (updates.length > 0) {
      const updatesPayload = updates.slice(0, 50).map((u) => ({
        id: u.id,
        task_id: u.taskId,
        user_id: u.userId,
        user_name: u.userName,
        user_avatar: u.userAvatar,
        progress_percentage: u.progressPercentage,
        status: u.status,
        accomplished: u.accomplished,
        currently_working_on: u.currentlyWorkingOn,
        next_step: u.nextStep,
        is_blocked: u.isBlocked,
        blocked_reason: u.blockedReason,
        estimated_completion_date: u.estimatedCompletionDate,
      }));
      const { error: uErr } = await client.from('task_updates').upsert(updatesPayload, { onConflict: 'id' });
      if (uErr) console.warn('Updates sync notice:', uErr.message);
    }

    return {
      success: true,
      message: `Successfully linked and pushed ${users.length} profiles, ${projects.length} projects, and ${tasks.length} tasks to Supabase!`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: msg };
  }
}

/**
 * Clear local information and connect directly to Supabase
 */
export async function clearAndLinkToSupabase(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Please provide your Supabase URL & Anon Key first.' };
  }

  try {
    // Clear demo storage keys
    localStorage.removeItem('vuew_tasks');
    localStorage.removeItem('vuew_projects');
    localStorage.removeItem('vuew_task_updates');
    localStorage.removeItem('vuew_activity_logs');
    localStorage.removeItem('vuew_notifications');

    // Attempt to pull from Supabase
    const pullRes = await pullFromSupabase();
    if (pullRes.success) {
      return {
        success: true,
        message: 'Local demo information cleared. Application is now live and linked directly to your Supabase database!',
      };
    }

    // If tables are empty in Supabase, push the clean baseline
    const pushRes = await pushToSupabase();
    return {
      success: true,
      message: pushRes.message,
    };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, message: `Could not link to Supabase: ${msg}` };
  }
}

/**
 * Single Task Upsert to Supabase
 */
export async function syncTaskToSupabase(task: Task): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('tasks').upsert({
      id: task.id,
      project_id: task.projectId,
      title: task.title,
      description: task.description,
      assignee_id: task.assigneeId,
      creator_id: task.creatorId,
      status: task.status,
      priority: task.priority,
      progress: task.progress,
      start_date: task.startDate,
      due_date: task.dueDate,
      estimated_completion_date: task.estimatedCompletionDate,
      latest_progress_update: task.latestProgressUpdate,
      next_step: task.nextStep,
      blocked_reason: task.blockedReason,
      health: task.health,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
  } catch (e) {
    console.warn('Silent Supabase task sync error:', e);
  }
}

/**
 * Single Task Update Insert to Supabase
 */
export async function syncTaskUpdateToSupabase(update: TaskUpdate): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('task_updates').insert({
      id: update.id,
      task_id: update.taskId,
      user_id: update.userId,
      user_name: update.userName,
      user_avatar: update.userAvatar,
      progress_percentage: update.progressPercentage,
      status: update.status,
      accomplished: update.accomplished,
      currently_working_on: update.currentlyWorkingOn,
      next_step: update.nextStep,
      is_blocked: update.isBlocked,
      blocked_reason: update.blockedReason,
      estimated_completion_date: update.estimatedCompletionDate,
      created_at: update.createdAt,
    });
  } catch (e) {
    console.warn('Silent Supabase task_update sync error:', e);
  }
}

/**
 * Single Project Upsert to Supabase
 */
export async function syncProjectToSupabase(project: Project): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('projects').upsert({
      id: project.id,
      name: project.name,
      description: project.description || '',
      owner_id: project.ownerId,
      team_member_ids: project.teamMemberIds || [],
      member_ids: project.teamMemberIds || [],
      start_date: project.startDate,
      deadline: project.deadline,
      status: project.status,
      overall_progress: project.overallProgress,
      health: project.health,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
  } catch (e) {
    console.warn('Silent Supabase project sync error:', e);
  }
}

/**
 * Single User/Profile Upsert to Supabase
 */
export async function syncUserToSupabase(user: User): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('profiles').upsert({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      job_title: user.jobTitle,
      avatar: user.avatar,
      pin: user.pin,
      department_id: user.departmentId,
    }, { onConflict: 'id' });
  } catch (e) {
    console.warn('Silent Supabase user profile sync error:', e);
  }
}

/**
 * Sync user PIN update to Supabase
 */
export async function syncUserPinToSupabase(userId: string, pin: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const cleanPin = pin.trim();
  try {
    const user = db.getUserById(userId);
    if (user) {
      await client.from('profiles').upsert({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        job_title: user.jobTitle,
        avatar: user.avatar,
        pin: cleanPin,
        department_id: user.departmentId,
      }, { onConflict: 'id' });
    } else {
      await client.from('profiles').update({ pin: cleanPin }).eq('id', userId);
    }
  } catch (e) {
    console.warn('Supabase pin sync error:', e);
  }
}

/**
 * Verify and synchronize Admin PIN against Supabase in case changed via Supabase SQL or remote console
 */
export async function verifyOrSyncAdminPin(enteredPin: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  const cleanPin = enteredPin.trim();
  try {
    // Check Supabase for admin profiles
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('role', 'ADMIN');

    if (error || !data || data.length === 0) return false;

    const matchedAdmin = data.find((p: any) => String(p.pin).trim() === cleanPin);
    if (matchedAdmin) {
      // Synchronize local DB with the updated admin data
      const users = db.getUsers();
      const localAdminIndex = users.findIndex((u) => u.role === 'ADMIN' || u.id === matchedAdmin.id);
      if (localAdminIndex !== -1) {
        users[localAdminIndex].pin = cleanPin;
        users[localAdminIndex].name = matchedAdmin.name || users[localAdminIndex].name;
        users[localAdminIndex].email = matchedAdmin.email || users[localAdminIndex].email;
        localStorage.setItem('vuew_users', JSON.stringify(users));
      }
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Supabase admin PIN verification fallback error:', err);
    return false;
  }
}

/**
 * Verify and synchronize Member PIN against Supabase in case changed via Supabase SQL or remote console
 */
export async function verifyOrSyncMemberPin(userId: string, enteredPin: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  const cleanPin = enteredPin.trim();
  try {
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return false;

    if (String(data.pin).trim() === cleanPin) {
      // Synchronize local user record
      const users = db.getUsers();
      const idx = users.findIndex((u) => u.id === userId);
      if (idx !== -1) {
        users[idx].pin = cleanPin;
        localStorage.setItem('vuew_users', JSON.stringify(users));
      }
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Supabase member PIN verification error:', err);
    return false;
  }
}

/**
 * Realtime setup
 */
let realtimeSubscription: any = null;

export function setupSupabaseRealtime(onUpdate: () => void): () => void {
  const client = getSupabaseClient();
  if (!client) return () => {};

  if (realtimeSubscription) {
    realtimeSubscription.unsubscribe();
  }

  try {
    realtimeSubscription = client
      .channel('vuew_realtime_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        pullFromSupabase().then(() => onUpdate());
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_updates' }, () => {
        pullFromSupabase().then(() => onUpdate());
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        pullFromSupabase().then(() => onUpdate());
      })
      .subscribe();

    return () => {
      if (realtimeSubscription) {
        realtimeSubscription.unsubscribe();
        realtimeSubscription = null;
      }
    };
  } catch (e) {
    console.warn('Could not setup Supabase Realtime:', e);
    return () => {};
  }
}
