import React, { useState } from 'react';
import {
  ListTodo,
  Plus,
  Search,
  Filter,
  LayoutList,
  Kanban,
  CalendarDays,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { TaskList } from '../components/tasks/TaskList';
import { TaskBoard } from '../components/tasks/TaskBoard';
import { TaskCalendar } from '../components/tasks/TaskCalendar';
import { TaskStatus, Priority, TaskHealth } from '../types';

export const TasksPage: React.FC = () => {
  const { tasks, projects, setCreateTaskModalOpen } = useData();
  const { allUsers, canCreateTask } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('ALL');
  const [selectedProject, setSelectedProject] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedHealth, setSelectedHealth] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'LIST' | 'BOARD' | 'CALENDAR'>('LIST');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const filteredTasks = tasks.filter((task) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        task.id.toLowerCase().includes(q) ||
        task.title.toLowerCase().includes(q) ||
        task.description.toLowerCase().includes(q);
      if (!match) return false;
    }
    // Assignee
    if (selectedAssignee !== 'ALL' && task.assigneeId !== selectedAssignee) return false;
    // Project
    if (selectedProject !== 'ALL' && task.projectId !== selectedProject) return false;
    // Status
    if (selectedStatus !== 'ALL' && task.status !== selectedStatus) return false;
    // Priority
    if (selectedPriority !== 'ALL' && task.priority !== selectedPriority) return false;
    // Health
    if (selectedHealth !== 'ALL' && task.health !== selectedHealth) return false;

    return true;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedAssignee('ALL');
    setSelectedProject('ALL');
    setSelectedStatus('ALL');
    setSelectedPriority('ALL');
    setSelectedHealth('ALL');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedAssignee !== 'ALL' ||
    selectedProject !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    selectedPriority !== 'ALL' ||
    selectedHealth !== 'ALL';

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-blue-400" />
            <span>Task Directory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global repository of all company work items, deliverables, and operational milestones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canCreateTask && (
            <button
              onClick={() => setCreateTaskModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, keyword, description... (e.g. 'auth', 'VUEW-104')"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Filter drawer toggle button */}
            <button
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                hasActiveFilters
                  ? 'bg-blue-600/15 border-blue-500/40 text-blue-400'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-blue-400" />
              )}
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button
                onClick={() => setViewMode('LIST')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === 'LIST' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="List View"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('BOARD')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === 'BOARD' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Board View"
              >
                <Kanban className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('CALENDAR')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === 'CALENDAR' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Calendar View"
              >
                <CalendarDays className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Drawer Dropdowns */}
        {showFilterDrawer && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-3 border-t border-slate-800/80">
            {/* Assignee */}
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Assignee
              </label>
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Assignees</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Project */}
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Project
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="BLOCKED">Blocked</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Priority
              </label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Priorities</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            {/* Health */}
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Health
              </label>
              <select
                value={selectedHealth}
                onChange={(e) => setSelectedHealth(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Health</option>
                <option value="ON_TRACK">On Track</option>
                <option value="NEEDS_ATTENTION">Needs Attention</option>
                <option value="AT_RISK">At Risk</option>
              </select>
            </div>
          </div>
        )}

        {/* Results count & Clear filters indicator */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>
            Showing <strong className="text-white font-mono">{filteredTasks.length}</strong> of{' '}
            <span className="font-mono">{tasks.length}</span> total tasks
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Task Content */}
      <div>
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40">
            <Filter className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-300">No tasks match your filter criteria</p>
            <p className="text-xs text-slate-400 mt-1">Try broadening your search keywords or resetting filters.</p>
          </div>
        ) : viewMode === 'LIST' ? (
          <TaskList tasks={filteredTasks} />
        ) : viewMode === 'BOARD' ? (
          <TaskBoard tasks={filteredTasks} />
        ) : (
          <TaskCalendar tasks={filteredTasks} />
        )}
      </div>
    </div>
  );
};
