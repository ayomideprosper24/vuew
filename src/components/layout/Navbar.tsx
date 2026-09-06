import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Plus,
  CheckCircle2,
  LogOut,
  KeyRound,
  Settings,
  ChevronDown,
  Download,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { OfflineIndicator } from '../pwa/OfflineIndicator';
import { PWAInstallModal } from '../pwa/PWAInstallModal';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { HamburgerButton } from '../common/HamburgerButton';
import { formatRelativeTime } from '../../utils/helpers';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  isMobileMenuOpen?: boolean;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileMenu,
  isMobileMenuOpen = false,
  setCurrentTab,
}) => {
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
    <header className="h-14 border-b border-zinc-800/90 bg-zinc-950/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left section: Hamburger on mobile + Global Search button */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="lg:hidden">
          <HamburgerButton
            isOpen={isMobileMenuOpen}
            onClick={onToggleMobileMenu}
            ariaLabel="Toggle mobile menu"
          />
        </div>

        <button
          onClick={() => setGlobalSearchOpen(true)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800/90 text-xs text-zinc-400 hover:border-orange-500/50 hover:text-zinc-200 transition-all shadow-sm group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-zinc-500 group-hover:text-orange-400 transition-colors" />
            <span className="truncate font-medium">Search tasks, projects, team...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono bg-zinc-800 text-zinc-400 rounded border border-zinc-700/60">
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
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all active:scale-[0.98]"
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
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-black text-xs font-bold shadow-md shadow-orange-500/20 transition-all active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        )}

        {/* Notifications Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
            className="relative p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-zinc-950 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
            )}
          </button>

          {notificationDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Notifications</span>
                  {unreadNotificationCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-500 text-black">
                      {unreadNotificationCount}
                    </span>
                  )}
                </div>
                {unreadNotificationCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-orange-400 hover:text-orange-300 font-bold"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-zinc-400">No notifications yet.</div>
                ) : (
                  notifications.slice(0, 6).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n.id, n.taskId)}
                      className={`p-3 text-left hover:bg-zinc-800/60 cursor-pointer transition-colors ${
                        !n.read ? 'bg-zinc-800/30' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className={`text-xs font-semibold ${!n.read ? 'text-orange-400 font-bold' : 'text-zinc-300'}`}>
                          {n.title}
                        </span>
                        <span className="text-[10px] text-zinc-400 whitespace-nowrap">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 border-t border-zinc-800 text-center bg-zinc-950/60">
                <button
                  onClick={() => {
                    setNotificationDropdownOpen(false);
                    setCurrentTab('notifications');
                  }}
                  className="text-xs text-orange-400 hover:text-orange-300 font-bold py-1 w-full"
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
            className="flex items-center gap-2 pl-2 border-l border-zinc-800 hover:opacity-90 transition-opacity"
          >
            <Avatar name={currentUser.name} avatar={currentUser.avatar} size="sm" />
            <div className="hidden sm:block text-left">
              <span className="block text-xs font-bold text-zinc-200 leading-tight">
                {currentUser.name.split(' ')[0]}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono capitalize">
                {currentUser.role.toLowerCase().replace('_', ' ')}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500 hidden sm:block" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden py-1">
              <div className="p-3.5 border-b border-zinc-800 bg-zinc-950/80">
                <div className="flex items-center gap-2.5">
                  <Avatar name={currentUser.name} avatar={currentUser.avatar} size="sm" />
                  <div className="truncate">
                    <span className="text-xs font-bold text-white block truncate">{currentUser.name}</span>
                    <span className="text-[10px] text-zinc-400 block truncate">{currentUser.email}</span>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <Badge variant="role" role={currentUser.role} size="sm" />
                  <span className="text-[10px] font-mono text-orange-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
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
                    className="w-full px-3.5 py-2 text-left text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/80 flex items-center gap-2.5 transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-orange-400" />
                    <span>Manage Member PINs</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    setCurrentTab('settings');
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/80 flex items-center gap-2.5 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Settings</span>
                </button>

                {/* PWA Install Entry in User Menu */}
                {isInstalled ? (
                  <div className="w-full px-3.5 py-2 text-left text-xs text-zinc-400 flex items-center gap-2.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>App Installed (PWA)</span>
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
                    className="w-full px-3.5 py-2 text-left text-xs text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Download className="w-3.5 h-3.5 text-orange-400" />
                      <span className="font-bold">Install PWA App</span>
                    </div>
                    <span className="text-[9px] font-black bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded border border-orange-500/30">
                      Mobile &amp; PC
                    </span>
                  </button>
                )}

                <div className="border-t border-zinc-800 my-1" />

                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    logout();
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
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
