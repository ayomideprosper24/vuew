import React, { useState } from 'react';
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
  X,
  Download,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { PWAInstallModal } from '../pwa/PWAInstallModal';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  currentTab,
  setCurrentTab,
}) => {
  const { currentUser, allUsers, switchUser } = useAuth();
  const { unreadNotificationCount } = useData();
  const { isInstalled, isInstallable, install } = usePWAInstall();
  const [installModalOpen, setInstallModalOpen] = useState(false);

  if (!isOpen) return null;

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

  const handleSelect = (id: string) => {
    setCurrentTab(id);
    onClose();
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'manual_instructions') {
        setInstallModalOpen(true);
      }
    } else {
      setInstallModalOpen(true);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 lg:hidden flex">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

        {/* Drawer */}
        <div className="relative w-4/5 max-w-xs bg-slate-950 border-r border-slate-800 flex flex-col h-full z-10 p-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm tracking-tight">
                V
              </div>
              <div>
                <span className="font-bold text-sm text-white tracking-tight">VUEW</span>
                <p className="text-[10px] text-slate-500 leading-tight">Vuew Team</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Switcher */}
          <div className="py-4 border-b border-slate-800">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Active User Perspective
            </label>
            <select
              value={currentUser.id}
              onChange={(e) => switchUser(e.target.value)}
              className="w-full text-xs bg-slate-900 text-slate-200 border border-slate-750 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>

          {/* Nav list */}
          <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              if (item.roles && !item.roles.includes(currentUser.role)) return null;
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-xs font-semibold bg-rose-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* PWA Install Button in Drawer */}
            <div className="pt-2">
              {isInstalled ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>VUEW PWA Installed</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span>Install App on Device</span>
                  </div>
                  <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded font-bold">
                    PWA
                  </span>
                </button>
              )}
            </div>
          </nav>

          {/* Footer info */}
          <div className="pt-3 border-t border-slate-800 flex items-center gap-2.5">
            <Avatar name={currentUser.name} avatar={currentUser.avatar} size="sm" />
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{currentUser.jobTitle}</p>
            </div>
          </div>
        </div>
      </div>

      <PWAInstallModal isOpen={installModalOpen} onClose={() => setInstallModalOpen(false)} />
    </>
  );
};
