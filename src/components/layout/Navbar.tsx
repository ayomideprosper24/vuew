import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Plus, CheckCircle2, AlertTriangle, Menu, Shield, LogOut, KeyRound, Settings, ChevronDown, Download, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { OfflineIndicator } from '../pwa/OfflineIndicator';
import { PWAInstallModal } from '../pwa/PWAInstallModal';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { formatRelativeTime } from '../../utils/helpers';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu, setCurrentTab }) => {
  const { currentUser, canCreateTask, logout } = useAuth();
  const {
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    setCreateTaskModalOpen,
    setGlobalSearchOpen,
    setSelectedTaskId,
    setProgressUpdateTaskId,
    tasks,
  } = useData();

  const { isInstalled, isInstallable, install } = usePWAInstall();
  const [pwaModalOpen, setPwaModalOpen] = useState(false);

  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setNotificationDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quick lookup of my active task to quick-update
  const myActiveTask = tasks.find(
    (t) => t.assigneeId === currentUser.id && t.status !== 'COMPLETED' && t.status !== 'CANCELLED'
  );

  const handleNotificationClick = (notifId: string, taskId?: string) => {
    markNotificationRead(notifId);
    setNotificationDropdownOpen(false);
    if (taskId) {
      setSelectedTaskId(taskId);
    } else {
      setCurrentTab('notifications');
    }
  };

  return (
    <header className="h-14 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left section: Hamburger on mobile + Global Search button */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={() => setGlobalSearchOpen(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800/90 text-xs text-slate-400 hover:border-slate-700 hover:text-slate-200 transition-all shadow-sm group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
            <span className="truncate">Search tasks, projects, team...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700/60">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right section: Quick actions + Notifications + Profile */}
      <div className="flex items-center gap-2.5">
        {/* Real-time Connection Indicator */}
        <OfflineIndicator />

        {/* Fast "Update Progress" button for team members */}
        {myActiveTask && (
          <button
            onClick={() => setProgressUpdateTaskId(myActiveTask.id)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all active:scale-[0.98]"
            title="Submit quick accountability progress update"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Update Progress</span>
          </button>
        )}

        {/* Create Task button for Admins */}
        {canCreateTask && (
          <button
            onClick={() => setCreateTaskModalOpen(true)}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        )}

        {/* Notifications Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
            className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-950" />
            )}
          </button>

          {notificationDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">Notifications</span>
                  {unreadNotificationCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-rose-500 text-white">
                      {unreadNotificationCount}
                    </span>
                  )}
                </div>
                {unreadNotificationCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No notifications yet.</div>
                ) : (
                  notifications.slice(0, 6).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n.id, n.taskId)}
                      className={`p-3 text-left hover:bg-slate-800/60 cursor-pointer transition-colors ${
                        !n.read ? 'bg-slate-800/30' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className={`text-xs font-semibold ${!n.read ? 'text-white' : 'text-slate-300'}`}>
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-800 text-center bg-slate-950/60">
                <button
                  onClick={() => {
                    setNotificationDropdownOpen(false);
                    setCurrentTab('notifications');
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium py-1 w-full"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Mini Avatar & Role Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 pl-2 border-l border-slate-800 hover:opacity-90 transition-opacity"
          >
            <Avatar name={currentUser.name} avatar={currentUser.avatar} size="sm" />
            <div className="hidden sm:block text-left">
              <span className="block text-xs font-semibold text-slate-200 leading-tight">
                {currentUser.name.split(' ')[0]}
              </span>
              <span className="text-[10px] text-slate-400 font-mono capitalize">
                {currentUser.role.toLowerCase().replace('_', ' ')}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden py-1">
              <div className="p-3 border-b border-slate-800 bg-slate-950/60">
                <div className="flex items-center gap-2.5">
                  <Avatar name={currentUser.name} avatar={currentUser.avatar} size="sm" />
                  <div className="truncate">
                    <span className="text-xs font-bold text-white block truncate">{currentUser.name}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{currentUser.email}</span>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <Badge variant="role" role={currentUser.role} size="sm" />
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    PIN: {currentUser.pin}
                  </span>
                </div>
              </div>

              <div className="py-1">
                {currentUser.role === 'ADMIN' && (
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setCurrentTab('team');
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/70 flex items-center gap-2.5 transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                    <span>Manage Member PINs</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    setCurrentTab('settings');
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/70 flex items-center gap-2.5 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Security &amp; Preferences</span>
                </button>

                {/* PWA Install Entry in User Menu */}
                {isInstalled ? (
                  <div className="w-full px-3.5 py-2 text-left text-xs text-slate-400 flex items-center gap-2.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>VUEW App Installed</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      setUserDropdownOpen(false);
                      if (isInstallable) {
                        const outcome = await install();
                        if (outcome === 'manual_instructions') {
                          setPwaModalOpen(true);
                        }
                      } else {
                        setPwaModalOpen(true);
                      }
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Download className="w-3.5 h-3.5 text-blue-400" />
                      <span>Install Vuew App</span>
                    </div>
                    <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30">
                      PWA
                    </span>
                  </button>
                )}

                <div className="border-t border-slate-800 my-1" />

                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    logout();
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Lock &amp; Return to PIN Login</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <PWAInstallModal isOpen={pwaModalOpen} onClose={() => setPwaModalOpen(false)} />
    </header>
  );
};
