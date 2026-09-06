import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Project, Task, TaskUpdate, Notification, ActivityLog } from '../types';

const STORAGE_KEY_URL = 'vuew_supabase_url';
const STORAGE_KEY_ANON = 'vuew_supabase_anon_key';

let cachedClient: SupabaseClient | null = null;
let lastConfigHash: string = '';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  isConfigured: boolean;
  lastTested?: string;
  error?: string;
}

export function getSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL || '';
  const envAnon = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_ANON_KEY || '';

  let storedUrl = '';
  let storedAnon = '';
  try {
    storedUrl = localStorage.getItem(STORAGE_KEY_URL) || '';
    storedAnon = localStorage.getItem(STORAGE_KEY_ANON) || '';
  } catch {
    // localStorage unavailable
  }

  const url = storedUrl || envUrl;
  const anonKey = storedAnon || envAnon;

  return {
    url,
    anonKey,
    isConnected: false,
    isConfigured: !!(url && anonKey),
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  try {
    if (url) {
      localStorage.setItem(STORAGE_KEY_URL, url.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_URL);
    }

    if (anonKey) {
      localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_ANON);
    }
  } catch (e) {
    console.warn('Could not save Supabase config to localStorage:', e);
  }

  // Invalidate cached client
  cachedClient = null;
  lastConfigHash = '';
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  const currentHash = `${url}:${anonKey}`;
  if (cachedClient && lastConfigHash === currentHash) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    lastConfigHash = currentHash;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(
  customUrl?: string,
  customAnonKey?: string
): Promise<{ success: boolean; message: string; latencyMs?: number }> {
  const url = customUrl || getSupabaseConfig().url;
  const anonKey = customAnonKey || getSupabaseConfig().anonKey;

  if (!url || !anonKey) {
    return {
      success: false,
      message: 'Supabase Project URL and Anon Key are required.',
    };
  }

  const start = performance.now();
  try {
    const tempClient = createClient(url, anonKey, {
      auth: { persistSession: false },
    });

    // Test health ping using auth settings or lightweight probe
    const { error } = await tempClient.from('profiles').select('count', { count: 'exact', head: true });
    const latencyMs = Math.round(performance.now() - start);

    if (error) {
      // If table does not exist yet, connection to Supabase itself succeeded
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: true,
          message: `Connected to Supabase (${latencyMs}ms)! Note: 'profiles' table not created yet. Please run the SQL schema.`,
          latencyMs,
        };
      }

      // If RLS blocked head query, connection is still valid
      if (error.code === 'PGRST301' || error.code === '42501') {
        return {
          success: true,
          message: `Connected to Supabase (${latencyMs}ms)! Tables are protected by RLS.`,
          latencyMs,
        };
      }

      return {
        success: false,
        message: error.message || 'Error connecting to Supabase instance.',
        latencyMs,
      };
    }

    return {
      success: true,
      message: `Successfully connected to Supabase (${latencyMs}ms). Schema is healthy!`,
      latencyMs,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Connection failed: ${msg}`,
    };
  }
}

// SQL Schema Definition string for users to copy or inspect
export const SUPABASE_SQL_SCHEMA = `-- ================================================================
-- VUEW Team Accountability & Execution Platform
-- Full Supabase Backend Architecture & Schema Definition
-- ================================================================

-- 1. Profiles / Users Table (with Admin & Team Member Credentials)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'TEAM_MEMBER', 'VIEWER')),
  job_title TEXT,
  avatar TEXT,
  pin TEXT NOT NULL DEFAULT '1234',
  department_id TEXT DEFAULT 'dept-eng',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#f97316',
  owner_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  team_member_ids TEXT[] NOT NULL DEFAULT '{}',
  member_ids TEXT[] NOT NULL DEFAULT '{}',
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  deadline TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  overall_progress INTEGER NOT NULL DEFAULT 0,
  budget NUMERIC,
  health TEXT NOT NULL DEFAULT 'ON_TRACK' CHECK (health IN ('ON_TRACK', 'NEEDS_ATTENTION', 'AT_RISK')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  creator_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('TODO', 'NOT_STARTED', 'IN_PROGRESS', 'BLOCKED', 'IN_REVIEW', 'COMPLETED', 'CANCELLED', 'PAUSED')),
  priority TEXT NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'URGENT')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  blocker_reason TEXT,
  blocked_reason TEXT,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date TIMESTAMPTZ NOT NULL,
  estimated_completion_date TIMESTAMPTZ,
  actual_completion_date TIMESTAMPTZ,
  latest_progress_update TEXT,
  next_step TEXT,
  health TEXT NOT NULL DEFAULT 'ON_TRACK' CHECK (health IN ('ON_TRACK', 'NEEDS_ATTENTION', 'AT_RISK')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  estimated_hours NUMERIC NOT NULL DEFAULT 1,
  actual_hours NUMERIC NOT NULL DEFAULT 0,
  tags TEXT[] NOT NULL DEFAULT '{}'
);

-- 4. Task Accountability Updates Table
CREATE TABLE IF NOT EXISTS public.task_updates (
  id TEXT PRIMARY KEY,
  task_id TEXT REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT,
  user_avatar TEXT,
  progress_percentage INTEGER CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  progress INTEGER CHECK (progress >= 0 AND progress <= 100),
  status TEXT,
  accomplished TEXT NOT NULL,
  currently_working_on TEXT,
  next_step TEXT NOT NULL,
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  blocker_reason TEXT,
  blocked_reason TEXT,
  estimated_completion_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  task_id TEXT REFERENCES public.tasks(id) ON DELETE SET NULL,
  project_id TEXT REFERENCES public.projects(id) ON DELETE SET NULL
);

-- 6. Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT,
  user_avatar TEXT,
  action TEXT NOT NULL,
  object_type TEXT,
  object_id TEXT,
  object_title TEXT,
  details TEXT,
  task_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_task_updates_task ON public.task_updates(task_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, read);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Team Access Policies
DROP POLICY IF EXISTS "Allow profiles all" ON public.profiles;
CREATE POLICY "Allow profiles all" ON public.profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow projects all" ON public.projects;
CREATE POLICY "Allow projects all" ON public.projects FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow tasks all" ON public.tasks;
CREATE POLICY "Allow tasks all" ON public.tasks FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow task_updates all" ON public.task_updates;
CREATE POLICY "Allow task_updates all" ON public.task_updates FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow notifications all" ON public.notifications;
CREATE POLICY "Allow notifications all" ON public.notifications FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow activity_logs all" ON public.activity_logs;
CREATE POLICY "Allow activity_logs all" ON public.activity_logs FOR ALL USING (true);

-- Initial Production Admin Profile Seed (Ayomide Prosper)
-- You can change '1234' to your desired initial Admin PIN/Password
INSERT INTO public.profiles (id, name, email, role, job_title, avatar, pin)
VALUES
  ('usr-admin', 'Ayomide Prosper', 'ayomideprosper24@gmail.com', 'ADMIN', 'Executive Lead (Admin)', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', '1234')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = 'ADMIN',
  pin = EXCLUDED.pin;
`;
