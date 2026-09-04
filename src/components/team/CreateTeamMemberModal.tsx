import React, { useState } from 'react';
import { UserPlus, KeyRound, Shield, RefreshCw } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface CreateTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTeamMemberModal: React.FC<CreateTeamMemberModalProps> = ({ isOpen, onClose }) => {
  const { createTeamMember } = useAuth();
  const { departments } = useData();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || 'dept-eng');
  const [pin, setPin] = useState('1234');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGeneratePin = () => {
    const random = Math.floor(1000 + Math.random() * 9000).toString();
    setPin(random);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !jobTitle || !pin) {
      setError('Please fill in all required fields.');
      return;
    }
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits.');
      return;
    }

    setIsSubmitting(true);
    const res = createTeamMember({
      name,
      email,
      jobTitle,
      departmentId,
      pin,
    });

    if (res.success) {
      setIsSubmitting(false);
      setName('');
      setEmail('');
      setJobTitle('');
      setPin('1234');
      setError('');
      onClose();
    } else {
      setIsSubmitting(false);
      setError(res.error || 'Failed to create member.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Team Member"
      subtitle="Register new team member and assign login PIN"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Marcus Vance"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Work Email *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. marcus@vuew.tech"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Job Title *
            </label>
            <input
              type="text"
              required
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Infrastructure Engineer"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Department
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Set Initial PIN */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
          <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Assign Initial Member PIN *
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                pattern="[0-9]*"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="button"
              onClick={handleGeneratePin}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold border border-slate-700"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
              <span>Random</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            The member will use this PIN to log in. You can change it anytime in the Team directory.
          </p>
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all active:scale-[0.98]"
          >
            Create Team Member
          </button>
        </div>
      </form>
    </Modal>
  );
};
