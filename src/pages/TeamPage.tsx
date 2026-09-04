import React, { useState } from 'react';
import { Users, Search, KeyRound, UserPlus, Eye, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { TeamMemberDetailModal } from '../components/team/TeamMemberDetailModal';
import { ManageMemberPinModal } from '../components/team/ManageMemberPinModal';
import { CreateTeamMemberModal } from '../components/team/CreateTeamMemberModal';
import { formatRelativeTime } from '../utils/helpers';
import { User } from '../types';

export const TeamPage: React.FC = () => {
  const { allUsers, currentUser } = useAuth();
  const { tasks, taskUpdates, departments } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [inspectMember, setInspectMember] = useState<User | null>(null);
  const [pinManageMember, setPinManageMember] = useState<User | null>(null);
  const [createMemberModalOpen, setCreateMemberModalOpen] = useState(false);

  const now = new Date('2026-09-04T14:39:36Z').getTime();

  const filteredMembers = allUsers.filter((member) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        member.name.toLowerCase().includes(q) ||
        member.jobTitle.toLowerCase().includes(q) ||
        member.email.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedDepartment !== 'ALL' && member.departmentId !== selectedDepartment) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Team Accountability
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Workload distribution, execution progress, and deliverable status.
          </p>
        </div>

        {currentUser.role === 'ADMIN' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const firstTeamMember = allUsers.find((u) => u.role === 'TEAM_MEMBER');
                if (firstTeamMember) setPinManageMember(firstTeamMember);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-blue-400" />
              <span>Manage PINs</span>
            </button>

            <button
              onClick={() => setCreateMemberModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter bar */}
      <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by name, role, email..."
            className="w-full bg-slate-950 border border-slate-800 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 whitespace-nowrap">Department:</span>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 w-full sm:w-auto"
          >
            <option value="ALL">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Team Table */}
      <div className="w-full overflow-x-auto rounded-lg border border-slate-800 bg-slate-900/40">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-semibold text-slate-400 uppercase tracking-wider select-none">
            <tr>
              <th className="py-3 px-4">Member</th>
              <th className="py-3 px-3">Role</th>
              <th className="py-3 px-3">Active Tasks</th>
              <th className="py-3 px-3 w-36">Progress</th>
              <th className="py-3 px-3">Overdue</th>
              <th className="py-3 px-3">Last Update</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredMembers.map((member) => {
              const memberTasks = tasks.filter((t) => t.assigneeId === member.id);
              const activeTasks = memberTasks.filter(
                (t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED'
              );
              const overdueTasks = memberTasks.filter((t) => {
                if (t.status === 'COMPLETED' || t.status === 'CANCELLED') return false;
                return new Date(t.dueDate).getTime() < now;
              });

              const avgProgress =
                memberTasks.length > 0
                  ? Math.round(
                      memberTasks.reduce((sum, t) => sum + t.progress, 0) / memberTasks.length
                    )
                  : 0;

              // Find latest update timestamp
              const userUpdates = taskUpdates.filter((u) => u.userId === member.id);
              let latestUpdate = 'No updates';
              if (userUpdates.length > 0) {
                const mostRecent = [...userUpdates].sort(
                  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )[0];
                latestUpdate = formatRelativeTime(mostRecent.createdAt);
              } else if (memberTasks.length > 0) {
                const mostRecent = [...memberTasks].sort(
                  (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                )[0];
                latestUpdate = formatRelativeTime(mostRecent.updatedAt);
              }

              // Status determination
              const hasBlocked = memberTasks.some((t) => t.status === 'BLOCKED');
              const hasAtRisk = memberTasks.some((t) => t.health === 'AT_RISK');

              let statusLabel = 'On track';
              let statusStyle = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

              if (hasBlocked) {
                statusLabel = 'Blocked';
                statusStyle = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
              } else if (overdueTasks.length > 0 || hasAtRisk) {
                statusLabel = 'At risk';
                statusStyle = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
              }

              return (
                <tr
                  key={member.id}
                  onClick={() => setInspectMember(member)}
                  className="hover:bg-slate-900/60 cursor-pointer transition-colors group"
                >
                  {/* Member info */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={member.name} avatar={member.avatar} size="sm" />
                      <div className="truncate">
                        <span className="font-medium text-slate-200 group-hover:text-white block truncate">
                          {member.name}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate">
                          {member.jobTitle}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <Badge variant="role" role={member.role} size="sm" />
                  </td>

                  {/* Active tasks */}
                  <td className="py-3 px-3">
                    <span className="font-mono text-slate-200 font-semibold">
                      {activeTasks.length}
                    </span>{' '}
                    <span className="text-slate-500">active</span>
                  </td>

                  {/* Progress */}
                  <td className="py-3 px-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>{avgProgress}%</span>
                      </div>
                      <ProgressBar progress={avgProgress} height="xs" />
                    </div>
                  </td>

                  {/* Overdue */}
                  <td className="py-3 px-3">
                    <span
                      className={`font-mono text-xs ${
                        overdueTasks.length > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {overdueTasks.length}
                    </span>
                  </td>

                  {/* Last Update */}
                  <td className="py-3 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                    {latestUpdate}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${statusStyle}`}>
                      {statusLabel}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      {currentUser.role === 'ADMIN' && (
                        <button
                          onClick={() => setPinManageMember(member)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[11px] font-medium flex items-center gap-1"
                          title="Manage Security PIN"
                        >
                          <KeyRound className="w-3 h-3 text-blue-400" />
                          <span>PIN</span>
                        </button>
                      )}

                      <button
                        onClick={() => setInspectMember(member)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[11px] font-medium flex items-center gap-1"
                        title="View Details"
                      >
                        <Eye className="w-3 h-3 text-slate-400" />
                        <span>Details</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Team Member Detail Modal */}
      <TeamMemberDetailModal member={inspectMember} onClose={() => setInspectMember(null)} />

      {/* Admin Manage PIN Modal */}
      <ManageMemberPinModal
        member={pinManageMember}
        isOpen={!!pinManageMember}
        onClose={() => setPinManageMember(null)}
      />

      {/* Create Team Member Modal */}
      <CreateTeamMemberModal
        isOpen={createMemberModalOpen}
        onClose={() => setCreateMemberModalOpen(false)}
      />
    </div>
  );
};
