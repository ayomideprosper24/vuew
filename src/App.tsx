import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { MyWorkPage } from './pages/MyWorkPage';
import { TasksPage } from './pages/TasksPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { TeamPage } from './pages/TeamPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ActivityPage } from './pages/ActivityPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';

// Common Modals
import { TaskDetailModal } from './components/tasks/TaskDetailModal';
import { UpdateProgressModal } from './components/tasks/UpdateProgressModal';
import { CreateTaskModal } from './components/tasks/CreateTaskModal';

const AppContent: React.FC = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const {
    selectedTaskId,
    setSelectedTaskId,
    progressUpdateTaskId,
    setProgressUpdateTaskId,
    createTaskModalOpen,
    setCreateTaskModalOpen,
    globalSearchOpen,
    setGlobalSearchOpen,
  } = useData();

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // When a user logs in or switches, land them on their personalized dashboard
  useEffect(() => {
    setCurrentTab('dashboard');
  }, [currentUser.id]);

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const renderActivePage = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage onNavigateToTab={setCurrentTab} />;
      case 'my-work':
        return <MyWorkPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'tasks':
        return <TasksPage />;
      case 'team':
        return <TeamPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'activity':
        return <ActivityPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigateToTab={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      <div className="flex flex-1 h-screen overflow-hidden">
        {/* Desktop Sidebar Navigation */}
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

        {/* Mobile Navigation Drawer */}
        <MobileNav
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-black">
          {/* Top Navbar */}
          <Navbar
            onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
            isMobileMenuOpen={mobileMenuOpen}
            setCurrentTab={setCurrentTab}
          />

          {/* Main Body */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-5 pb-24 lg:pb-8">
            <div className="max-w-7xl mx-auto w-full">
              {renderActivePage()}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onToggleDrawer={() => setMobileMenuOpen(!mobileMenuOpen)}
        isDrawerOpen={mobileMenuOpen}
      />

      {/* Global Modals */}
      <TaskDetailModal
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
      />

      <UpdateProgressModal
        taskId={progressUpdateTaskId}
        onClose={() => setProgressUpdateTaskId(null)}
      />

      <CreateTaskModal
        isOpen={createTaskModalOpen}
        onClose={() => setCreateTaskModalOpen(false)}
      />

      <GlobalSearchModal
        isOpen={globalSearchOpen}
        onClose={() => setGlobalSearchOpen(false)}
        onNavigateToTab={setCurrentTab}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
