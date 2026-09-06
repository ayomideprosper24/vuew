import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  ListTodo,
  FolderGit2,
  Bell,
  Menu,
} from 'lucide-react';
import { useData } from '../../context/DataContext';

interface MobileBottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onToggleDrawer: () => void;
  isDrawerOpen?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab,
  onToggleDrawer,
  isDrawerOpen = false,
}) => {
  const { unreadNotificationCount } = useData();

  const primaryItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-work', label: 'My Work', icon: CheckSquare },
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'notifications', label: 'Alerts', icon: Bell, badge: unreadNotificationCount },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800/80 px-2 py-1 safe-area-pb">
      <nav className="flex items-center justify-around">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = !isDrawerOpen && currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id);
                if (isDrawerOpen) onToggleDrawer();
              }}
              className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-1 rounded-xl transition-all ${
                isActive
                  ? 'text-orange-400 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 active:scale-95'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-orange-400' : 'text-zinc-400'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] rounded-full text-[9px] font-black bg-orange-500 text-black flex items-center justify-center shadow-sm">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0.5 w-4 h-0.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
              )}
            </button>
          );
        })}

        {/* More/Menu button to open/close full drawer */}
        <button
          onClick={onToggleDrawer}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-1 rounded-xl active:scale-95 transition-all ${
            isDrawerOpen
              ? 'text-orange-400 font-semibold'
              : 'text-zinc-400 hover:text-orange-400'
          }`}
          aria-label={isDrawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isDrawerOpen}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
            {isDrawerOpen ? 'Close' : 'Menu'}
          </span>
          {isDrawerOpen && (
            <span className="absolute bottom-0.5 w-4 h-0.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
          )}
        </button>
      </nav>
    </div>
  );
};
