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
    { id: 'team', label: 'Team', icon: Users },
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
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
          isActive
            ? 'bg-orange-500/15 text-orange-400 font-bold border border-orange-500/30'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Icon
            className={`w-4 h-4 flex-shrink-0 ${
              isActive ? 'text-orange-400' : 'text-zinc-500'
            }`}
          />
          <span className="truncate">{item.label}</span>
        </div>
        {item.badge !== undefined && item.badge > 0 && (
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-orange-500 text-black min-w-[18px] text-center">
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside
      className={`hidden lg:flex w-60 bg-zinc-950 border-r border-zinc-800/90 flex-col h-full flex-shrink-0 select-none ${className}`}
    >
      {/* Brand Header */}
      <div className="h-14 px-4 border-b border-zinc-800/90 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-black font-black text-base shadow-[0_0_15px_rgba(249,115,22,0.35)]">
            V
          </div>
          <div>
            <span className="font-black text-sm text-white tracking-tight">VUEW</span>
            <span className="text-[10px] text-zinc-500 block leading-tight font-medium">Accountability</span>
          </div>
        </div>

        {canCreateTask && (
          <button
            onClick={() => setCreateTaskModalOpen(true)}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-orange-400 hover:bg-zinc-900 transition-colors"
            title="Create Task"
            aria-label="Create Task"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
        {/* Workspace */}
        <div className="space-y-0.5">
          <div className="px-2 pb-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            Workspace
          </div>
          {workspaceNav.map(renderNavButton)}
        </div>

        {/* Management (Admin only) */}
        {currentUser.role === 'ADMIN' && (
          <div className="space-y-0.5">
            <div className="px-2 pb-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Management
            </div>
            {managementNav.map(renderNavButton)}
          </div>
        )}

        {/* Other */}
        <div className="space-y-0.5">
          <div className="px-2 pb-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            Other
          </div>
          {otherNav.map(renderNavButton)}
        </div>
      </div>

      {/* Footer Area: Settings & Perspective Switcher */}
      <div className="p-3 border-t border-zinc-800/90 space-y-2 bg-zinc-950">
        {renderNavButton({ id: 'settings', label: 'Settings', icon: Settings })}

        {/* Perspective Quick Switcher */}
        <div className="pt-2 border-t border-zinc-900">
          <div className="flex items-center justify-between px-1 mb-1 text-[10px] text-zinc-400 font-semibold">
            <span>Active Perspective</span>
            <Badge variant="role" role={currentUser.role} size="sm" />
          </div>

          <div className="relative">
            <select
              value={currentUser.id}
              onChange={(e) => switchUser(e.target.value)}
              className="w-full text-xs bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 rounded-xl py-2 pl-2.5 pr-7 appearance-none cursor-pointer focus:outline-none focus:border-orange-500 truncate transition-colors"
              title="Switch user perspective"
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role === 'ADMIN' ? 'Admin' : 'Member'})
                </option>
              ))}
            </select>
            <ArrowUpDown className="w-3 h-3 text-zinc-500 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>
      </div>
    </aside>
  );
};
