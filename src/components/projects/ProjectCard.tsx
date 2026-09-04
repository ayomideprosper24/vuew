import React from 'react';
import { Calendar, Users, CheckSquare, ArrowRight } from 'lucide-react';
import { Project } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { ProgressBar } from '../common/ProgressBar';
import { Avatar } from '../common/Avatar';
import { HealthIndicator } from '../common/HealthIndicator';
import { formatDate } from '../../utils/helpers';

interface ProjectCardProps {
  project: Project;
  onSelect?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
  const { tasks } = useData();
  const { allUsers } = useAuth();

  const owner = allUsers.find((u) => u.id === project.ownerId);
  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const completedTasks = projectTasks.filter((t) => t.status === 'COMPLETED').length;
  const blockedTasks = projectTasks.filter((t) => t.status === 'BLOCKED').length;

  return (
    <div
      onClick={onSelect}
      className="group rounded-2xl bg-slate-900/80 border border-slate-800 p-5 hover:border-slate-700 hover:bg-slate-900 transition-all duration-200 shadow-sm flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Top meta */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            {project.status}
          </span>
          <HealthIndicator health={project.health} size="sm" />
        </div>

        {/* Project Name & Description */}
        <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors mb-1.5 line-clamp-1">
          {project.name}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {project.description}
        </p>
      </div>

      <div>
        {/* Overall progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
            <span>Overall Progress</span>
            <span className="text-white font-bold">{project.overallProgress}%</span>
          </div>
          <ProgressBar progress={project.overallProgress} health={project.health} height="sm" />
        </div>

        {/* Task Counts Summary */}
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-4 text-center">
          <div>
            <span className="block text-xs font-mono font-bold text-slate-200">{projectTasks.length}</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Total</span>
          </div>
          <div>
            <span className="block text-xs font-mono font-bold text-emerald-400">{completedTasks}</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Done</span>
          </div>
          <div>
            <span className={`block text-xs font-mono font-bold ${blockedTasks > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {blockedTasks}
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Blocked</span>
          </div>
        </div>

        {/* Footer info: Owner & Deadline */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            {owner && (
              <div className="flex items-center gap-1.5" title={`Project Owner: ${owner.name}`}>
                <Avatar name={owner.name} avatar={owner.avatar} size="xs" />
                <span className="text-[11px] text-slate-300 truncate max-w-[90px]">{owner.name.split(' ')[0]}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 font-mono text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Due {formatDate(project.deadline)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
