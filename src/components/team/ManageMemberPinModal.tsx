import React, { useState } from 'react';
import { KeyRound, Shield, Check, RefreshCw, Eye, EyeOff, Lock, UserCheck } from 'lucide-react';
import { Modal } from '../common/Modal';
import { User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';

interface ManageMemberPinModalProps {
  member: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ManageMemberPinModal: React.FC<ManageMemberPinModalProps> = ({
  member,
  isOpen,
  onClose,
}) => {
  const { setMemberPin, currentUser } = useAuth();

  const [newPin, setNewPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!member || currentUser.role !== 'ADMIN') return null;

  const handleGenerateRandomPin = () => {
    const random = Math.floor(1000 + Math.random() * 9000).toString();
    setNewPin(random);
    setErrorMsg('');
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin || newPin.length < 4) {
      setErrorMsg('PIN must be at least 4 digits long.');
      return;
    }

    const ok = setMemberPin(member.id, newPin);
    if (ok) {
      setSuccessMsg(`PIN for ${member.name} successfully updated to ${newPin}!`);
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
        setNewPin('');
      }, 1500);
    } else {
      setErrorMsg('Failed to update member PIN.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Set Member Access PIN"
      subtitle={`Configure security PIN for ${member.name}`}
      maxWidth="md"
    >
      <form onSubmit={handleSavePin} className="space-y-5 text-sm">
        {/* Target Member Card */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center gap-3">
            <Avatar name={member.name} avatar={member.avatar} size="md" />
            <div>
              <h4 className="text-xs font-bold text-white">{member.name}</h4>
              <p className="text-[11px] text-slate-400">{member.jobTitle}</p>
            </div>
          </div>
          <Badge variant="role" role={member.role} size="sm" />
        </div>

        {/* Current PIN Display */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Current Active PIN
            </span>
            <span className="font-mono text-base font-bold text-emerald-400">
              {showPin ? member.pin : '••••'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowPin(!showPin)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title={showPin ? 'Hide PIN' : 'Reveal PIN'}
          >
            {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* New PIN Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Assign New Security PIN
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                pattern="[0-9]*"
                maxLength={6}
                value={newPin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setNewPin(val);
                  setErrorMsg('');
                }}
                placeholder="e.g. 4829"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerateRandomPin}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex-shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
              <span>Generate</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            The team member will log into VUEW using this exact PIN.
          </p>
        </div>

        {/* Error / Success feedback */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!newPin}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold transition-all active:scale-[0.98]"
          >
            Save Member PIN
          </button>
        </div>
      </form>
    </Modal>
  );
};
