import React, { useState, useEffect } from 'react';
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
  Database,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { PWAInstallModal } from '../pwa/PWAInstallModal';
import { Avatar } from '../common/Avatar';
import { HamburgerButton } from '../common/HamburgerButton';

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

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-work', label: 'My Work', icon: CheckSquare },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['ADMIN'] },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotificationCount },
    { id: 'activity', label: 'Activity Logs', icon: Activity },
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
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop with fade transition */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/85 backdrop-blur-sm"
              onClick={onClose}
              aria-hidden="true"
            />

            {/* Sliding Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-4/5 max-w-xs bg-zinc-950 border-r border-zinc-800/90 flex flex-col h-full z-10 p-5 shadow-2xl safe-area-pt safe-area-pb"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-black font-black text-base shadow-[0_0_15px_rgba(249,115,22,0.35)]">
                    V
                  </div>
                  <div>
                    <span className="font-extrabold text-base text-white tracking-tight">VUEW</span>
                    <p className="text-[10px] text-zinc-400 font-medium leading-tight">Accountability Platform</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-orange-400" />
                </button>
              </div>

              {/* User Switcher Perspective */}
              <div className="py-4 border-b border-zinc-800/80">
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Active User Perspective
                </label>
                <select
                  value={currentUser.id}
                  onChange={(e) => switchUser(e.target.value)}
                  className="w-full text-xs bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500 transition-colors"
                >
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 py-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  if (item.roles && !item.roles.includes(currentUser.role)) return null;
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 font-bold'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-zinc-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-500 text-black">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* PWA Install Entry in Mobile Nav */}
                <div className="pt-3">
                  {isInstalled ? (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-300">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>VUEW PWA Installed</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleInstallClick}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 transition-all active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-orange-400" />
                        <span>Install App (PWA)</span>
                      </div>
                      <span className="text-[10px] bg-orange-500 text-black px-1.5 py-0.5 rounded font-black">
                        Mobile
                      </span>
                    </button>
                  )}
                </div>
              </nav>

              {/* Drawer Footer */}
              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5 truncate">
                  <Avatar name={currentUser.name} avatar={currentUser.avatar} size="sm" />
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{currentUser.jobTitle}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-orange-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                  PIN: {currentUser.pin}
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PWAInstallModal isOpen={installModalOpen} onClose={() => setInstallModalOpen(false)} />
    </>
  );
};
