import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  FolderGit2,
  ListTodo,
  Users,
  BarChart3,
  Bell,
  Activity,
  Settings,
  Shield,
  Layers,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  className?: string;
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  className = '',
  onNavigate,
}) => {
  const { currentUser, allUsers, switchUser, canCreateTask } = useAuth();
  const { unreadNotificationCount, setCreateTaskModalOpen } = useData();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-work', label: 'My Work', icon: CheckSquare },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'team', label: 'Team', icon: Users, roles: ['ADMIN'] },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['ADMIN'] },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotificationCount },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNav = (tabId: string) => {
    setCurrentTab(tabId);
    if (onNavigate) onNavigate();
  };

  return (
    <aside
      className={`w-64 bg-slate-950/90 border-r border-slate-800/80 flex flex-col h-full flex-shrink-0 select-none ${className}`}
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black tracking-wider text-base shadow-[0_0_20px_rgba(59,130,246,0.35)]">
            V
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-lg text-white font-mono">VUEW</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
                CORE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium truncate max-w-[130px]">
              Team Accountability
            </p>
          </div>
        </div>
      </div>

      {/* Quick Role Switcher (Crucial for testing all role perspectives seamlessly) */}
      <div className="px-4 py-3 bg-slate-900/50 border-b border-slate-800/60">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-blue-400" /> Switch Perspective
          </span>
          <span className="text-[10px] text-slate-400">Demo</span>
        </div>
        <select
          value={currentUser.id}
          onChange={(e) => switchUser(e.target.value)}
          className="w-full text-xs bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
        >
          {allUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.role.replace('_', ' ')})
            </option>
          ))}
        </select>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate">
            <Avatar name={currentUser.name} avatar={currentUser.avatar} size="xs" />
            <span className="text-xs text-slate-200 font-medium truncate">{currentUser.name}</span>
          </div>
          <Badge variant="role" role={currentUser.role} size="sm" />
        </div>
      </div>

      {/* Quick Action for Admins */}
      {canCreateTask && (
        <div className="px-4 pt-3">
          <button
            onClick={() => setCreateTaskModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Task</span>
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          WORKSPACE
        </div>
        {navItems.map((item) => {
          // Check role restrictions if any
          if (item.roles && !item.roles.includes(currentUser.role)) {
            return null;
          }

          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.2 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-rose-500 text-white min-w-[18px] text-center">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom User Card */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div
          onClick={() => handleNav('settings')}
          className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/60 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2.5 truncate">
            <Avatar name={currentUser.name} avatar={currentUser.avatar} size="sm" showOnlineStatus />
            <div className="truncate text-left">
              <p className="text-xs font-semibold text-slate-200 truncate">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{currentUser.jobTitle}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
};
