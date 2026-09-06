-- ================================================================
-- VUEW Team Accountability & Execution Platform
-- Full Supabase Backend Architecture & Schema Definition
-- ================================================================
-- HOW TO RUN THIS IN SUPABASE:
-- 1. Open your Supabase Project Dashboard (https://supabase.com/dashboard)
-- 2. Click "SQL Editor" in the left navigation sidebar
-- 3. Click "New Query" (top right)
-- 4. Paste this entire script and click the green "Run" button
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

-- Team Access Policies (supports public anon & authenticated access)
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

-- Enable Realtime Replication for Live Multi-Device Sync
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
EXCEPTION WHEN duplicate_object THEN
  -- Table already in publication
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.task_updates;
EXCEPTION WHEN duplicate_object THEN
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- ================================================================
-- INITIAL ADMIN PROFILE SETUP & SEED
-- ================================================================
-- Sets up your primary Admin profile with your email and PIN:
INSERT INTO public.profiles (id, name, email, role, job_title, avatar, pin)
VALUES
  ('usr-5', 'Admin Lead', 'ayomideprosper24@gmail.com', 'ADMIN', 'Executive Technology Lead (Admin)', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', '1234'),
  ('usr-1', 'John Doe', 'john@vuew.tech', 'TEAM_MEMBER', 'Lead Frontend Engineer', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', '2024'),
  ('usr-2', 'Sarah Williams', 'sarah@vuew.tech', 'TEAM_MEMBER', 'Head of Product & UX', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', '5678')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  pin = EXCLUDED.pin,
  role = 'ADMIN';

-- ================================================================
-- HOW TO CHANGE YOUR ADMIN PASSWORD / PIN AT ANY TIME:
-- Run this single SQL query whenever you want to change your PIN:
--
-- UPDATE public.profiles 
-- SET pin = 'YOUR_NEW_ADMIN_PIN' 
-- WHERE email = 'ayomideprosper24@gmail.com' OR role = 'ADMIN';
-- ================================================================
