import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  ListTodo,
  FolderGit2,
  Users,
  BarChart3,
  Bell,
  Activity,
  Settings,
  Plus,
  ArrowUpDown,
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

  const handleNav = (tabId: string) => {
    setCurrentTab(tabId);
    if (onNavigate) onNavigate();
  };

  const workspaceNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-work', label: 'My Work', icon: CheckSquare },
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
  ];

  const managementNav = [
    { id: 'team', label: 'Team', icon: Users, adminOnly: true },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, adminOnly: true },
  ];

  const otherNav = [
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotificationCount },
    { id: 'activity', label: 'Activity', icon: Activity },
  ];

  const renderNavButton = (item: {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }) => {
    const isActive = currentTab === item.id;
    const Icon = item.icon;

    return (
      <button
        key={item.id}
        onClick={() => handleNav(item.id)}
        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
          isActive
            ? 'bg-blue-600/10 text-blue-400 font-semibold'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Icon
            className={`w-4 h-4 flex-shrink-0 ${
              isActive ? 'text-blue-400' : 'text-slate-500'
            }`}
          />
          <span className="truncate">{item.label}</span>
        </div>
        {item.badge !== undefined && item.badge > 0 && (
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-rose-500 text-white min-w-[18px] text-center">
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside
      className={`w-60 bg-slate-950 border-r border-slate-800/80 flex flex-col h-full flex-shrink-0 select-none ${className}`}
    >
      {/* Brand Header */}
      <div className="h-14 px-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm tracking-tight shadow-sm">
            V
          </div>
          <div>
            <span className="font-bold text-sm text-white tracking-tight">VUEW</span>
            <span className="text-[10px] text-slate-500 block leading-tight">Vuew Team</span>
          </div>
        </div>

        {canCreateTask && (
          <button
            onClick={() => setCreateTaskModalOpen(true)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            title="Create Task"
            aria-label="Create Task"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 px-3 py-3 space-y-5 overflow-y-auto">
        {/* Workspace */}
        <div className="space-y-0.5">
          <div className="px-2 pb-1.5 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
            Workspace
          </div>
          {workspaceNav.map(renderNavButton)}
        </div>

        {/* Management (Admin only) */}
        {currentUser.role === 'ADMIN' && (
          <div className="space-y-0.5">
            <div className="px-2 pb-1.5 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              Management
            </div>
            {managementNav.map(renderNavButton)}
          </div>
        )}

        {/* Other */}
        <div className="space-y-0.5">
          <div className="px-2 pb-1.5 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
            Other
          </div>
          {otherNav.map(renderNavButton)}
        </div>
      </div>

      {/* Footer Area: Settings & Perspective Switcher */}
      <div className="p-3 border-t border-slate-800/80 space-y-2 bg-slate-950">
        {renderNavButton({ id: 'settings', label: 'Settings', icon: Settings })}

        {/* Perspective Quick Switcher */}
        <div className="pt-2 border-t border-slate-900">
          <div className="flex items-center justify-between px-1 mb-1 text-[10px] text-slate-500 font-medium">
            <span>Signed in as</span>
            <Badge variant="role" role={currentUser.role} size="sm" />
          </div>

          <div className="relative">
            <select
              value={currentUser.id}
              onChange={(e) => switchUser(e.target.value)}
              className="w-full text-xs bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 rounded-md py-1.5 pl-2 pr-6 appearance-none cursor-pointer focus:outline-none focus:border-slate-700 truncate"
              title="Switch user perspective for testing"
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role === 'ADMIN' ? 'Admin' : 'Member'})
                </option>
              ))}
            </select>
            <ArrowUpDown className="w-3 h-3 text-slate-500 absolute right-2 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>
    </aside>
  );
};
