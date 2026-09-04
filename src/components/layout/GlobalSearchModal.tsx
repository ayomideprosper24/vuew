import React, { useState, useEffect, useRef } from 'react';
import { Search, ListTodo, FolderGit2, Users, MessageSquare, ArrowRight, X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';
import { Avatar } from '../common/Avatar';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  const { tasks, projects, comments, setSelectedTaskId } = useData();
  const { allUsers } = useAuth();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle Cmd+K global listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or context
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchingTasks = q
    ? tasks.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.status.toLowerCase().includes(q) ||
          t.priority.toLowerCase().includes(q)
      ).slice(0, 5)
    : [];

  const matchingProjects = q
    ? projects.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const matchingUsers = q
    ? allUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.jobTitle.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const matchingComments = q
    ? comments.filter((c) => c.content.toLowerCase().includes(q)).slice(0, 3)
    : [];

  const hasResults =
    matchingTasks.length > 0 ||
    matchingProjects.length > 0 ||
    matchingUsers.length > 0 ||
    matchingComments.length > 0;

  const handleSelectTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    onClose();
  };

  const handleSelectProject = (_projectId: string) => {
    onNavigateToTab('projects');
    onClose();
  };

  const handleSelectUser = (_userId: string) => {
    onNavigateToTab('team');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-900/90">
          <Search className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, projects, team members, comments... (e.g. 'dashboard', 'blocked', 'Sarah')"
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-white rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 divide-y divide-slate-800/60">
          {!q && (
            <div className="py-12 text-center text-slate-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-medium text-slate-400">Search VUEW Workspace</p>
              <p className="text-xs text-slate-400 mt-1">
                Type any task code like <span className="text-blue-400 font-mono">VUEW-101</span>, teammate name, or blocker topic
              </p>
            </div>
          )}

          {q && !hasResults && (
            <div className="py-10 text-center text-slate-400 text-sm">
              No matches found for &quot;<span className="text-white font-medium">{query}</span>&quot;
            </div>
          )}

          {/* Tasks Results */}
          {matchingTasks.length > 0 && (
            <div className="py-3 first:pt-0">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <ListTodo className="w-3.5 h-3.5 text-blue-400" />
                <span>Tasks ({matchingTasks.length})</span>
              </div>
              <div className="space-y-1">
                {matchingTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTask(t.id)}
                    className="p-2.5 rounded-lg hover:bg-slate-800/80 cursor-pointer flex items-center justify-between gap-3 group transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="font-mono text-xs font-bold text-blue-400">{t.id}</span>
                      <span className="text-sm text-slate-200 group-hover:text-white truncate font-medium">
                        {t.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="status" status={t.status} size="sm" />
                      <span className="text-xs font-mono text-slate-400">{t.progress}%</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects Results */}
          {matchingProjects.length > 0 && (
            <div className="py-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <FolderGit2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Projects ({matchingProjects.length})</span>
              </div>
              <div className="space-y-1">
                {matchingProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProject(p.id)}
                    className="p-2.5 rounded-lg hover:bg-slate-800/80 cursor-pointer flex items-center justify-between gap-3 group transition-colors"
                  >
                    <div className="truncate">
                      <p className="text-sm font-medium text-slate-200 group-hover:text-white truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{p.description}</p>
                    </div>
                    <Badge variant="health" health={p.health} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users Results */}
          {matchingUsers.length > 0 && (
            <div className="py-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>Team Members ({matchingUsers.length})</span>
              </div>
              <div className="space-y-1">
                {matchingUsers.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => handleSelectUser(u.id)}
                    className="p-2.5 rounded-lg hover:bg-slate-800/80 cursor-pointer flex items-center justify-between gap-3 group transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Avatar name={u.name} avatar={u.avatar} size="sm" />
                      <div className="truncate">
                        <p className="text-sm font-medium text-slate-200 group-hover:text-white truncate">
                          {u.name}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{u.jobTitle}</p>
                      </div>
                    </div>
                    <Badge variant="role" role={u.role} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments Results */}
          {matchingComments.length > 0 && (
            <div className="py-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>Comments & Discussion</span>
              </div>
              <div className="space-y-1">
                {matchingComments.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectTask(c.taskId)}
                    className="p-2.5 rounded-lg hover:bg-slate-800/80 cursor-pointer text-left group transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-300">{c.userName}</span>
                      <span className="text-[10px] text-blue-400 font-mono">on {c.taskId}</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{c.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Search index updated real-time</span>
          <div className="flex items-center gap-2">
            <span>Press ESC to exit</span>
          </div>
        </div>
      </div>
    </div>
  );
};
