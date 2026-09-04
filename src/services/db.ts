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
  INITIALIZED: 'vuew_initialized_v3_pin',
};

// Seed Data
export const INITIAL_USERS: User[] = [
  {
    id: 'usr-5',
    name: 'Alex Mercer',
    email: 'alex@vuew.tech',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    role: 'ADMIN',
    departmentId: 'dept-ops',
    jobTitle: 'VP of Engineering & Technology (Admin)',
    status: 'ACTIVE',
    createdAt: '2025-11-01T08:00:00Z',
    lastActive: '2026-09-04T14:38:00Z',
    bio: 'Executive technology leader maintaining architectural hygiene and organizational execution velocity.',
    phone: '+1 (555) 678-9012',
    pin: '1234',
  },
  {
    id: 'usr-1',
    name: 'John Doe',
    email: 'john@vuew.tech',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'TEAM_MEMBER',
    departmentId: 'dept-eng',
    jobTitle: 'Lead Frontend Engineer',
    status: 'ACTIVE',
    createdAt: '2026-01-15T08:00:00Z',
    lastActive: '2026-09-04T14:15:00Z',
    bio: 'Specializing in reactive user interfaces, performance optimization, and design systems.',
    phone: '+1 (555) 234-5678',
    pin: '2024',
  },
  {
    id: 'usr-2',
    name: 'Sarah Williams',
    email: 'sarah@vuew.tech',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    role: 'TEAM_MEMBER',
    departmentId: 'dept-prod',
    jobTitle: 'Head of Product & UX',
    status: 'ACTIVE',
    createdAt: '2026-01-10T08:00:00Z',
    lastActive: '2026-09-04T14:30:00Z',
    bio: 'Product strategist focused on user empathy, rapid validation, and high execution cadence.',
    phone: '+1 (555) 345-6789',
    pin: '5678',
  },
  {
    id: 'usr-3',
    name: 'David James',
    email: 'david@vuew.tech',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'TEAM_MEMBER',
    departmentId: 'dept-eng',
    jobTitle: 'Senior Backend & DevOps Engineer',
    status: 'ACTIVE',
    createdAt: '2026-02-01T08:00:00Z',
    lastActive: '2026-09-04T13:45:00Z',
    bio: 'Distributed systems, database reliability, and cloud architecture enthusiast.',
    phone: '+1 (555) 456-7890',
    pin: '3344',
  },
  {
    id: 'usr-4',
    name: 'Mike Johnson',
    email: 'mike@vuew.tech',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'TEAM_MEMBER',
    departmentId: 'dept-mkt',
    jobTitle: 'Growth & Marketing Director',
    status: 'ACTIVE',
    createdAt: '2026-02-15T08:00:00Z',
    lastActive: '2026-09-04T12:00:00Z',
    bio: 'Scaling SaaS distribution, enterprise acquisition, and technical brand narrative.',
    phone: '+1 (555) 567-8901',
    pin: '7788',
  },
  {
    id: 'usr-6',
    name: 'Rachel Green',
    email: 'rachel@vuew.tech',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    role: 'TEAM_MEMBER',
    departmentId: 'dept-ops',
    jobTitle: 'Operations & Strategy Associate',
    status: 'ACTIVE',
    createdAt: '2026-03-01T08:00:00Z',
    lastActive: '2026-09-03T16:00:00Z',
    bio: 'Operations and business development execution.',
    phone: '+1 (555) 789-0123',
    pin: '9900',
  },
];

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'dept-eng', name: 'Engineering', description: 'Core software engineering, QA, DevOps and infrastructure', leadUserId: 'usr-5', memberCount: 2 },
  { id: 'dept-prod', name: 'Product & UX', description: 'Product strategy, design systems, UX research and specifications', leadUserId: 'usr-2', memberCount: 1 },
  { id: 'dept-mkt', name: 'Marketing & Growth', description: 'SaaS distribution, content strategy, developer relations and enterprise acquisition', leadUserId: 'usr-4', memberCount: 1 },
  { id: 'dept-ops', name: 'Internal Operations', description: 'People operations, legal, SOC2 compliance, and financial administration', leadUserId: 'usr-5', memberCount: 2 },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Vuew Website',
    description: 'Public marketing website, customer documentation, and brand portal redesign with high conversion paths.',
    ownerId: 'usr-2',
    teamMemberIds: ['usr-1', 'usr-2', 'usr-3'],
    startDate: '2026-08-15',
    deadline: '2026-09-18',
    status: 'ACTIVE',
    overallProgress: 72,
    health: 'ON_TRACK',
    createdAt: '2026-08-10T10:00:00Z',
    updatedAt: '2026-09-04T12:00:00Z',
  },
  {
    id: 'proj-2',
    name: 'Vuew Mobile App',
    description: 'Cross-platform iOS and Android mobile companion client for on-the-go progress updates and instant blocker triage.',
    ownerId: 'usr-2',
    teamMemberIds: ['usr-1', 'usr-2', 'usr-3'],
    startDate: '2026-08-20',
    deadline: '2026-09-25',
    status: 'ACTIVE',
    overallProgress: 58,
    health: 'NEEDS_ATTENTION',
    createdAt: '2026-08-18T10:00:00Z',
    updatedAt: '2026-09-04T11:00:00Z',
  },
  {
    id: 'proj-3',
    name: 'Internal Operations',
    description: 'Core infrastructure automation, SOC2 readiness audit, database clustering, and security incident playbooks.',
    ownerId: 'usr-5',
    teamMemberIds: ['usr-3', 'usr-5'],
    startDate: '2026-08-01',
    deadline: '2026-09-30',
    status: 'ACTIVE',
    overallProgress: 64,
    health: 'NEEDS_ATTENTION',
    createdAt: '2026-07-28T10:00:00Z',
    updatedAt: '2026-09-04T10:00:00Z',
  },
  {
    id: 'proj-4',
    name: 'Marketing',
    description: 'Q4 Product Hunt launch campaign, enterprise sales demo deck, and technical case study publications.',
    ownerId: 'usr-4',
    teamMemberIds: ['usr-4', 'usr-2'],
    startDate: '2026-08-25',
    deadline: '2026-10-15',
    status: 'ACTIVE',
    overallProgress: 35,
    health: 'ON_TRACK',
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-09-03T15:00:00Z',
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'VUEW-101',
    title: 'Build Vuew Dashboard',
    description: 'Design and implement the high-performance executive and personal dashboard displaying team progress, active deliverables, at-risk radar, and quick accountability updates.',
    projectId: 'proj-1',
    assigneeId: 'usr-1', // John Doe
    creatorId: 'usr-2', // Sarah Williams
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    progress: 68,
    startDate: '2026-09-01',
    dueDate: '2026-09-08',
    estimatedCompletionDate: '2026-09-07',
    createdAt: '2026-09-01T09:00:00Z',
    updatedAt: '2026-09-04T14:15:00Z',
    latestProgressUpdate: 'Completed authentication screens and connected the user API. Currently working on the dashboard.',
    nextStep: 'Finish notification system and begin mobile responsiveness.',
    blockedReason: '',
    health: 'ON_TRACK',
    attachments: [
      {
        id: 'att-1',
        name: 'Dashboard_Design_v2.fig',
        size: '14.2 MB',
        url: '#',
        uploadedBy: 'Sarah Williams',
        uploadedAt: '2026-09-01T10:30:00Z',
        type: 'figma',
      },
    ],
  },
  {
    id: 'VUEW-102',
    title: 'User Authentication & RBAC API',
    description: 'Implement secure PIN authentication, session persistence, role permissions matrix (Admin vs Team Member), and role-protected endpoint authorization.',
    projectId: 'proj-1',
    assigneeId: 'usr-3', // David James
    creatorId: 'usr-5', // Alex Mercer
    priority: 'URGENT',
    status: 'IN_REVIEW',
    progress: 100,
    startDate: '2026-08-28',
    dueDate: '2026-09-05',
    estimatedCompletionDate: '2026-09-04',
    createdAt: '2026-08-28T09:00:00Z',
    updatedAt: '2026-09-04T13:40:00Z',
    latestProgressUpdate: 'Wrapped PIN verification lifecycle, rate-limiting guards, and verified RBAC policy suite. Passed 48 unit tests.',
    nextStep: 'Awaiting admin sign-off and production staging merge.',
    blockedReason: '',
    health: 'ON_TRACK',
    attachments: [
      {
        id: 'att-2',
        name: 'rbac-security-audit.pdf',
        size: '1.8 MB',
        url: '#',
        uploadedBy: 'David James',
        uploadedAt: '2026-09-04T13:35:00Z',
        type: 'pdf',
      },
    ],
  },
  {
    id: 'VUEW-103',
    title: 'Push Notification Engine & Mobile Delivery',
    description: 'Build native APNS and Firebase Cloud Messaging gateway for instant mobile alerts when blockers occur or deadlines approach.',
    projectId: 'proj-2',
    assigneeId: 'usr-3', // David James
    creatorId: 'usr-2', // Sarah Williams
    priority: 'HIGH',
    status: 'BLOCKED',
    progress: 45,
    startDate: '2026-08-30',
    dueDate: '2026-09-07',
    estimatedCompletionDate: '2026-09-10',
    createdAt: '2026-08-30T10:00:00Z',
    updatedAt: '2026-09-04T11:00:00Z',
    latestProgressUpdate: 'Completed Apple Push Notification service payload structure and offline queue handler.',
    nextStep: 'Resume integration testing as soon as APNS production certificates are provisioned by IT Security.',
    blockedReason: 'Awaiting Apple Developer APNS certificate and token generation from IT Security.',
    health: 'AT_RISK',
    attachments: [],
  },
  {
    id: 'VUEW-104',
    title: 'Design System Tokens & Mobile Figma Specs',
    description: 'Create scalable design tokens for typography, spacing rhythm, dark tech color palette, and touch-target guidelines for mobile execution.',
    projectId: 'proj-2',
    assigneeId: 'usr-2', // Sarah Williams
    creatorId: 'usr-5', // Alex Mercer
    priority: 'MEDIUM',
    status: 'COMPLETED',
    progress: 100,
    startDate: '2026-08-20',
    dueDate: '2026-09-03',
    estimatedCompletionDate: '2026-09-03',
    actualCompletionDate: '2026-09-03T16:45:00Z',
    createdAt: '2026-08-20T09:00:00Z',
    updatedAt: '2026-09-03T16:45:00Z',
    latestProgressUpdate: 'All token variables published in Figma and handed off to engineering with zero open questions.',
    nextStep: 'Support mobile implementation reviews.',
    blockedReason: '',
    health: 'ON_TRACK',
    attachments: [],
  },
  {
    id: 'VUEW-105',
    title: 'Q4 Enterprise Growth & Product Hunt Launch Deck',
    description: 'Draft go-to-market announcement, product walkthrough video script, and high-converting launch assets targeting technical engineering leaders.',
    projectId: 'proj-4',
    assigneeId: 'usr-4', // Mike Johnson
    creatorId: 'usr-5', // Alex Mercer
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    progress: 30,
    startDate: '2026-08-26',
    dueDate: '2026-09-15',
    estimatedCompletionDate: '2026-09-14',
    createdAt: '2026-08-26T11:00:00Z',
    updatedAt: '2026-09-03T15:30:00Z',
    latestProgressUpdate: 'Completed initial messaging copy and customer problem statements focusing on meeting fatigue.',
    nextStep: 'Finalize animated demo sequences with product team.',
    blockedReason: '',
    health: 'ON_TRACK',
    attachments: [],
  },
  {
    id: 'VUEW-106',
    title: 'Database Performance Tuning & Read Replicas',
    description: 'Optimize slow queries, introduce connection pooling, configure automated read replica failovers, and verify index efficiency.',
    projectId: 'proj-3',
    assigneeId: 'usr-3', // David James
    creatorId: 'usr-5', // Alex Mercer
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    progress: 25,
    startDate: '2026-09-01',
    dueDate: '2026-09-06',
    estimatedCompletionDate: '2026-09-09',
    createdAt: '2026-09-01T09:00:00Z',
    updatedAt: '2026-09-02T16:00:00Z',
    latestProgressUpdate: 'Identified 3 unbounded scan queries on task audit logs and drafted composite index migration.',
    nextStep: 'Execute benchmark script under simulated 500 req/sec load.',
    blockedReason: '',
    health: 'AT_RISK', // Low progress with 2 days to deadline, estimated late
    attachments: [],
  },
  {
    id: 'VUEW-107',
    title: 'Automated Slack & Webhook Notification Integration',
    description: 'Build outbound webhook triggers so task updates, blocker alerts, and admin approvals can broadcast to team Slack channels automatically.',
    projectId: 'proj-3',
    assigneeId: 'usr-1', // John Doe
    creatorId: 'usr-2', // Sarah Williams
    priority: 'MEDIUM',
    status: 'NOT_STARTED',
    progress: 0,
    startDate: '2026-09-09',
    dueDate: '2026-09-18',
    estimatedCompletionDate: '2026-09-17',
    createdAt: '2026-09-02T14:00:00Z',
    updatedAt: '2026-09-02T14:00:00Z',
    latestProgressUpdate: '',
    nextStep: 'Review Slack Block Kit schema and define webhook payload templates.',
    blockedReason: '',
    health: 'ON_TRACK',
    attachments: [],
  },
  {
    id: 'VUEW-108',
    title: 'Customer Onboarding & Accountability Telemetry',
    description: 'Set up instrumentation for measuring team cadence, task turnaround time, and reduction in internal status sync meetings.',
    projectId: 'proj-1',
    assigneeId: 'usr-2', // Sarah Williams
    creatorId: 'usr-5', // Alex Mercer
    priority: 'LOW',
    status: 'PAUSED',
    progress: 15,
    startDate: '2026-08-25',
    dueDate: '2026-09-22',
    estimatedCompletionDate: '2026-09-25',
    createdAt: '2026-08-25T11:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z',
    latestProgressUpdate: 'Drafted telemetry event schema for task status transitions.',
    nextStep: 'Resume after website redesign core release.',
    blockedReason: 'Paused pending completion of website redesign milestone.',
    health: 'NEEDS_ATTENTION',
    attachments: [],
  },
];

export const INITIAL_TASK_UPDATES: TaskUpdate[] = [
  {
    id: 'upd-1',
    taskId: 'VUEW-101',
    userId: 'usr-1',
    userName: 'John Doe',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    progressPercentage: 10,
    status: 'IN_PROGRESS',
    accomplished: 'Started project and set up component hierarchy and Tailwind token mapping.',
    currentlyWorkingOn: 'Setting up client state store and mock endpoints.',
    nextStep: 'Build core navigation layout and metric widgets.',
    isBlocked: false,
    estimatedCompletionDate: '2026-09-08',
    createdAt: '2026-09-01T15:00:00Z',
  },
  {
    id: 'upd-2',
    taskId: 'VUEW-101',
    userId: 'usr-1',
    userName: 'John Doe',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    progressPercentage: 35,
    status: 'IN_PROGRESS',
    accomplished: 'Task started. Completed base visual tokens, card components, and layout structure.',
    currentlyWorkingOn: 'Developing the interactive task cards and progress indicators.',
    nextStep: 'Build user authentication and profile drawer.',
    isBlocked: false,
    estimatedCompletionDate: '2026-09-08',
    createdAt: '2026-09-02T16:30:00Z',
  },
  {
    id: 'upd-3',
    taskId: 'VUEW-101',
    userId: 'usr-1',
    userName: 'John Doe',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    progressPercentage: 55,
    status: 'IN_PROGRESS',
    accomplished: 'Finished authentication screens and metric cards. Wired up real-time filter toggles.',
    currentlyWorkingOn: 'Connecting data services to the personal workspace view.',
    nextStep: 'Connect user API and build the 1-minute progress update workflow.',
    isBlocked: false,
    estimatedCompletionDate: '2026-09-07',
    createdAt: '2026-09-03T17:15:00Z',
  },
  {
    id: 'upd-4',
    taskId: 'VUEW-101',
    userId: 'usr-1',
    userName: 'John Doe',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    progressPercentage: 68,
    status: 'IN_PROGRESS',
    accomplished: 'Completed authentication screens and connected the user API. Currently working on the dashboard.',
    currentlyWorkingOn: 'Refining the interactive dashboard analytics, search dialog, and filter states.',
    nextStep: 'Finish notification system and begin mobile responsiveness.',
    isBlocked: false,
    estimatedCompletionDate: '2026-09-07',
    createdAt: '2026-09-04T14:15:00Z',
  },
  {
    id: 'upd-5',
    taskId: 'VUEW-102',
    userId: 'usr-3',
    userName: 'David James',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    progressPercentage: 50,
    status: 'IN_PROGRESS',
    accomplished: 'Finished authentication middleware and PIN verification abstractions.',
    currentlyWorkingOn: 'Writing RBAC policy evaluator for Admin vs Team Member permissions.',
    nextStep: 'Build integration tests for role endpoints.',
    isBlocked: false,
    estimatedCompletionDate: '2026-09-04',
    createdAt: '2026-09-03T11:00:00Z',
  },
  {
    id: 'upd-6',
    taskId: 'VUEW-102',
    userId: 'usr-3',
    userName: 'David James',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    progressPercentage: 100,
    status: 'IN_REVIEW',
    accomplished: 'Wrapped PIN rotation, session persistence and role-based permissions matrix. Submitted for admin approval.',
    currentlyWorkingOn: 'Nothing currently active. Ready for review.',
    nextStep: 'Awaiting review feedback before deploying to staging.',
    isBlocked: false,
    estimatedCompletionDate: '2026-09-04',
    createdAt: '2026-09-04T13:40:00Z',
  },
  {
    id: 'upd-7',
    taskId: 'VUEW-103',
    userId: 'usr-3',
    userName: 'David James',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    progressPercentage: 45,
    status: 'BLOCKED',
    accomplished: 'APNS payload handler and FCM adapter coded and unit-tested in isolation.',
    currentlyWorkingOn: 'Waiting for credentials to verify real push delivery.',
    nextStep: 'Resume testing once APNS certificate is signed by IT.',
    isBlocked: true,
    blockedReason: 'Awaiting Apple Developer APNS certificate and token generation from IT Security.',
    estimatedCompletionDate: '2026-09-10',
    createdAt: '2026-09-04T11:00:00Z',
  },
];

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'com-1',
    taskId: 'VUEW-101',
    userId: 'usr-2',
    userName: 'Sarah Williams',
    userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    userRole: 'TEAM_MEMBER',
    content: '@John Doe Looking great! Make sure the "Update Progress" button is prominently placed on mobile so team members can submit their updates in under 30 seconds without friction.',
    mentions: ['John Doe'],
    createdAt: '2026-09-03T18:00:00Z',
  },
  {
    id: 'com-2',
    taskId: 'VUEW-101',
    userId: 'usr-1',
    userName: 'John Doe',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    userRole: 'TEAM_MEMBER',
    content: 'Absolutely @Sarah Williams. I added a dedicated quick-action banner with auto-saved drafts so nothing gets lost.',
    mentions: ['Sarah Williams'],
    parentCommentId: 'com-1',
    createdAt: '2026-09-04T09:15:00Z',
  },
  {
    id: 'com-3',
    taskId: 'VUEW-103',
    userId: 'usr-2',
    userName: 'Sarah Williams',
    userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    userRole: 'TEAM_MEMBER',
    content: '@David James Thanks for raising this blocker immediately. I just expedited the APNS certificate request with IT security.',
    mentions: ['David James'],
    createdAt: '2026-09-04T11:45:00Z',
  },
  {
    id: 'com-4',
    taskId: 'VUEW-102',
    userId: 'usr-5',
    userName: 'Alex Mercer',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    userRole: 'ADMIN',
    content: 'Reviewing the audit log now. Architecture looks very clean and adheres to our zero-trust requirements.',
    mentions: [],
    createdAt: '2026-09-04T14:00:00Z',
  },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    userId: 'usr-1',
    title: 'New Comment on VUEW-101',
    message: 'Sarah Williams commented: "Looking great! Make sure the Update Progress button is prominently placed..."',
    type: 'TASK_COMMENT',
    taskId: 'VUEW-101',
    projectId: 'proj-1',
    read: false,
    createdAt: '2026-09-03T18:00:00Z',
  },
  {
    id: 'notif-2',
    userId: 'usr-2',
    title: 'Task Blocked: VUEW-103',
    message: 'David James marked "Push Notification Engine" as BLOCKED: Awaiting Apple Developer APNS certificate.',
    type: 'TASK_BLOCKED',
    taskId: 'VUEW-103',
    projectId: 'proj-2',
    read: false,
    createdAt: '2026-09-04T11:00:00Z',
  },
  {
    id: 'notif-3',
    userId: 'usr-2',
    title: 'Task Ready for Review: VUEW-102',
    message: 'David James submitted "User Authentication & RBAC API" for admin approval.',
    type: 'SUBMITTED_FOR_REVIEW',
    taskId: 'VUEW-102',
    projectId: 'proj-1',
    read: true,
    createdAt: '2026-09-04T13:40:00Z',
  },
  {
    id: 'notif-4',
    userId: 'usr-1',
    title: 'Task Assigned: VUEW-107',
    message: 'Sarah Williams assigned you "Automated Slack & Webhook Notification Integration".',
    type: 'TASK_ASSIGNED',
    taskId: 'VUEW-107',
    projectId: 'proj-3',
    read: true,
    createdAt: '2026-09-02T14:00:00Z',
  },
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'act-1',
    userId: 'usr-1',
    userName: 'John Doe',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    action: 'updated progress from 55% to 68%',
    objectType: 'TASK',
    objectId: 'VUEW-101',
    objectTitle: 'Build Vuew Dashboard',
    timestamp: '2026-09-04T14:15:00Z',
  },
  {
    id: 'act-2',
    userId: 'usr-3',
    userName: 'David James',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    action: 'submitted work for admin review (100%)',
    objectType: 'TASK',
    objectId: 'VUEW-102',
    objectTitle: 'User Authentication & RBAC API',
    timestamp: '2026-09-04T13:40:00Z',
  },
  {
    id: 'act-3',
    userId: 'usr-3',
    userName: 'David James',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    action: 'marked task as BLOCKED',
    objectType: 'TASK',
    objectId: 'VUEW-103',
    objectTitle: 'Push Notification Engine & Mobile Delivery',
    timestamp: '2026-09-04T11:00:00Z',
  },
  {
    id: 'act-4',
    userId: 'usr-2',
    userName: 'Sarah Williams',
    userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    action: 'approved and marked completed',
    objectType: 'TASK',
    objectId: 'VUEW-104',
    objectTitle: 'Design System Tokens & Mobile Figma Specs',
    timestamp: '2026-09-03T16:45:00Z',
  },
  {
    id: 'act-5',
    userId: 'usr-1',
    userName: 'John Doe',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    action: 'updated progress from 35% to 55%',
    objectType: 'TASK',
    objectId: 'VUEW-101',
    objectTitle: 'Build Vuew Dashboard',
    timestamp: '2026-09-03T17:15:00Z',
  },
  {
    id: 'act-6',
    userId: 'usr-2',
    userName: 'Sarah Williams',
    userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    action: 'created task and assigned to John Doe',
    objectType: 'TASK',
    objectId: 'VUEW-107',
    objectTitle: 'Automated Slack & Webhook Notification Integration',
    timestamp: '2026-09-02T14:00:00Z',
  },
];

export const INITIAL_SETTINGS: SystemSettings = {
  staleTaskThresholdDays: 3,
  atRiskDaysBeforeDeadline: 3,
  requireReviewForCompletion: true,
  emailNotificationsEnabled: true,
  slackWebhookUrl: 'https://hooks.slack.com/services/VUEW/ALERTS/SAMPLE',
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
    if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
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
    this.set(STORAGE_KEYS.INITIALIZED, 'true');
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
    const user = this.getUserById(userId);
    if (!user) return false;
    this.updateUser({ ...user, pin: newPin });
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
