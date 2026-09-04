import React, { useState } from 'react';
import { Plus, ArrowRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ProjectCard } from '../components/projects/ProjectCard';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { Modal } from '../components/common/Modal';
import { ProgressBar } from '../components/common/ProgressBar';
import { HealthIndicator } from '../components/common/HealthIndicator';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';
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
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Projects
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track initiative velocity, milestones, and deliverable health.
          </p>
        </div>

        {canCreateTask && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Project</span>
          </button>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          subtitle={`Project: ${selectedProject.id}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-sm">
            {/* Meta Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block mb-1">
                  Health
                </span>
                <HealthIndicator health={selectedProject.health} size="sm" />
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase block mb-1">
                  Status
                </span>
                <span className="text-xs font-mono text-slate-300">
                  {selectedProject.status}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase block mb-1">
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
                <span className="text-[10px] text-slate-500 uppercase block mb-1">
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
            <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Overall Completion Rate
                </span>
                <span className="font-mono text-base font-bold text-blue-400">
                  {selectedProject.overallProgress}%
                </span>
              </div>
              <ProgressBar
                progress={selectedProject.overallProgress}
                health={selectedProject.health}
                height="sm"
              />
            </div>

            {/* Project Deliverables / Tasks */}
            <div>
              <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Deliverables ({projectTasks.length})
              </h3>

              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {projectTasks.length === 0 ? (
                  <p className="text-xs text-slate-500">No tasks created under this project yet.</p>
                ) : (
                  projectTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedProjectId(null);
                        setSelectedTaskId(t.id);
                      }}
                      className="p-2.5 rounded-md bg-slate-950/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono text-xs text-blue-400">{t.id}</span>
                        <span className="text-xs text-slate-200 group-hover:text-white truncate">
                          {t.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="status" status={t.status} size="sm" />
                        <span className="text-xs font-mono text-slate-300">{t.progress}%</span>
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
