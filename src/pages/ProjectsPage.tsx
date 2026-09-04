import React, { useState } from 'react';
import { FolderGit2, Plus, Calendar, Users, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ProjectCard } from '../components/projects/ProjectCard';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { Modal } from '../components/common/Modal';
import { ProgressBar } from '../components/common/ProgressBar';
import { HealthIndicator } from '../components/common/HealthIndicator';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';
import { Task } from '../types';
import { formatDate } from '../utils/helpers';

export const ProjectsPage: React.FC = () => {
  const { projects, tasks, setSelectedTaskId } = useData();
  const { allUsers, canCreateTask } = useAuth();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const projectTasks = selectedProject ? tasks.filter((t) => t.projectId === selectedProject.id) : [];
  const projectOwner = selectedProject ? allUsers.find((u) => u.id === selectedProject.ownerId) : null;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-blue-400" />
            <span>Projects &amp; Initiatives</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Group related deliverables, track milestone velocity, and monitor overall operational health.
          </p>
        </div>

        {canCreateTask && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </button>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onSelect={() => setSelectedProjectId(project.id)}
          />
        ))}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <Modal
          isOpen={!!selectedProjectId}
          onClose={() => setSelectedProjectId(null)}
          title={selectedProject.name}
          subtitle={`Project ID: ${selectedProject.id}`}
          maxWidth="3xl"
        >
          <div className="space-y-6 text-sm">
            {/* Meta Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Health
                </span>
                <HealthIndicator health={selectedProject.health} size="sm" />
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Status
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                  {selectedProject.status}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Lead Owner
                </span>
                <div className="flex items-center gap-1.5">
                  <Avatar name={projectOwner?.name || 'Owner'} avatar={projectOwner?.avatar} size="xs" />
                  <span className="text-xs text-slate-200 font-medium truncate">
                    {projectOwner?.name || 'Unassigned'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Target Deadline
                </span>
                <span className="text-xs text-slate-200 font-mono">
                  {formatDate(selectedProject.deadline)}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800">
              {selectedProject.description}
            </p>

            {/* Overall Progress */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Overall Completion Rate
                </span>
                <span className="font-mono text-xl font-black text-blue-400">
                  {selectedProject.overallProgress}%
                </span>
              </div>
              <ProgressBar
                progress={selectedProject.overallProgress}
                health={selectedProject.health}
                height="md"
              />
            </div>

            {/* Project Deliverables / Tasks */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Linked Deliverables ({projectTasks.length})
                </h4>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {projectTasks.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No tasks created under this project yet.</p>
                ) : (
                  projectTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedProjectId(null);
                        setSelectedTaskId(t.id);
                      }}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="font-mono text-xs font-bold text-blue-400">{t.id}</span>
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                          {t.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="status" status={t.status} size="sm" />
                        <span className="text-xs font-mono font-bold text-slate-300">{t.progress}%</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} />
    </div>
  );
};
