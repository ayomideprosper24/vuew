import React, { useState } from 'react';
import { Users, Search, Filter, ShieldCheck, UserCheck, KeyRound, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { TeamMemberCard } from '../components/team/TeamMemberCard';
import { TeamMemberDetailModal } from '../components/team/TeamMemberDetailModal';
import { ManageMemberPinModal } from '../components/team/ManageMemberPinModal';
import { CreateTeamMemberModal } from '../components/team/CreateTeamMemberModal';
import { User } from '../types';

export const TeamPage: React.FC = () => {
  const { allUsers, currentUser } = useAuth();
  const { departments } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [inspectMember, setInspectMember] = useState<User | null>(null);
  const [pinManageMember, setPinManageMember] = useState<User | null>(null);
  const [createMemberModalOpen, setCreateMemberModalOpen] = useState(false);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            <span>Team Overview &amp; Workload</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time workload distribution, accountability cadence, and execution bandwidth across all personnel.
          </p>
        </div>

        {currentUser.role === 'ADMIN' && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                const firstTeamMember = allUsers.find((u) => u.role === 'TEAM_MEMBER');
                if (firstTeamMember) setPinManageMember(firstTeamMember);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-semibold transition-all shadow-sm active:scale-[0.98]"
            >
              <KeyRound className="w-3.5 h-3.5 text-blue-400" />
              <span>Set Member PINs</span>
            </button>

            <button
              onClick={() => setCreateMemberModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, title, email..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 whitespace-nowrap">Department:</span>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 w-full sm:w-auto"
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

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMembers.map((member) => (
          <TeamMemberCard
            key={member.id}
            member={member}
            onSelect={() => setInspectMember(member)}
            onManagePin={() => setPinManageMember(member)}
          />
        ))}
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
