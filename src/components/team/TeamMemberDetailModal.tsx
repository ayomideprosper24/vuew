import React, { useState } from 'react';
import { Mail, Briefcase, Calendar, CheckSquare, Clock, AlertCircle, Phone, ArrowRight, KeyRound, Check } from 'lucide-react';
import { User, Task } from '../../types';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { TaskCard } from '../tasks/TaskCard';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

interface TeamMemberDetailModalProps {
  member: User | null;
  onClose: () => void;
}

export const TeamMemberDetailModal: React.FC<TeamMemberDetailModalProps> = ({ member, onClose }) => {
  const { tasks, departments, taskUpdates, setSelectedTaskId } = useData();
  const { currentUser, setMemberPin } = useAuth();
  const [editingPin, setEditingPin] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');
  const [pinSaved, setPinSaved] = useState(false);

  if (!member) return null;

  const department = departments.find((d) => d.id === member.departmentId);
  const userTasks = tasks.filter((t) => t.assigneeId === member.id);
  const userUpdates = taskUpdates.filter((u) => u.userId === member.id);

  const activeTasks = userTasks.filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
  const completedTasks = userTasks.filter((t) => t.status === 'COMPLETED');
  const blockedTasks = userTasks.filter((t) => t.status === 'BLOCKED');

  const avgProgress =
    activeTasks.length > 0
      ? Math.round(activeTasks.reduce((acc, t) => acc + t.progress, 0) / activeTasks.length)
      : completedTasks.length > 0
      ? 100
      : 0;

  return (
    <Modal
      isOpen={!!member}
      onClose={onClose}
      title={`${member.name}'s Workload & Responsibilities`}
      subtitle={`${member.jobTitle} • ${department?.name || 'Department'}`}
      maxWidth="3xl"
    >
      <div className="space-y-6 text-sm">
        {/* Profile overview card */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar name={member.name} avatar={member.avatar} size="xl" showOnlineStatus />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{member.name}</h3>
                <Badge variant="role" role={member.role} size="sm" />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{member.email}</p>
              {member.bio && <p className="text-xs text-slate-300 mt-2 max-w-md italic">{member.bio}</p>}

              {currentUser.role === 'ADMIN' && (
                <div className="mt-3 inline-flex items-center gap-2 p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                  <KeyRound className="w-3.5 h-3.5 text-blue-400 ml-1" />
                  <span className="text-xs text-slate-400">PIN:</span>
                  {editingPin ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={newPinInput}
                        onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="New PIN"
                        className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newPinInput.length >= 4) {
                            setMemberPin(member.id, newPinInput);
                            setPinSaved(true);
                            setEditingPin(false);
                            setTimeout(() => setPinSaved(false), 2500);
                          }
                        }}
                        className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingPin(false)}
                        className="px-1.5 py-0.5 text-slate-400 text-[11px]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-400">{member.pin}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setNewPinInput(member.pin);
                          setEditingPin(true);
                        }}
                        className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline"
                      >
                        Change
                      </button>
                      {pinSaved && (
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Updated
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="sm:text-right text-xs text-slate-400">
            <div className="font-mono text-sm text-slate-200 font-bold">{userTasks.length} Total Tasks</div>
            <div className="text-[11px] text-slate-500">{completedTasks.length} completed</div>
          </div>
        </div>

        {/* Progress & Metric Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <span className="text-xs text-slate-400 font-medium block mb-1">Active Deliverables</span>
            <span className="font-mono text-2xl font-bold text-blue-400">{activeTasks.length}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <span className="text-xs text-slate-400 font-medium block mb-1">Average Progress</span>
            <span className="font-mono text-2xl font-bold text-emerald-400">{avgProgress}%</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
            <span className="text-xs text-slate-400 font-medium block mb-1">Blocked Items</span>
            <span className={`font-mono text-2xl font-bold ${blockedTasks.length > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {blockedTasks.length}
            </span>
          </div>
        </div>

        {/* Active Tasks List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Assigned Tasks ({userTasks.length})
            </h4>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {userTasks.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 rounded-xl border border-dashed border-slate-800">
                No tasks assigned to {member.name} yet.
              </div>
            ) : (
              userTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    onClose();
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

        {/* Recent accountability updates */}
        <div className="pt-2 border-t border-slate-800">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Recent Accountability Updates ({userUpdates.length})
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {userUpdates.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No progress logs submitted yet.</p>
            ) : (
              userUpdates.slice(0, 4).map((upd) => (
                <div key={upd.id} className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-blue-400 font-bold">{upd.taskId} • {upd.progressPercentage}%</span>
                    <span className="text-[10px] text-slate-500">{new Date(upd.createdAt).toLocaleDateString()}</span>
                  </div>
                  {upd.accomplished && <p className="text-slate-300 line-clamp-1">{upd.accomplished}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
