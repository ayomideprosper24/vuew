import React, { useState, useEffect } from 'react';
import { Shield, KeyRound, UserCheck, ArrowRight, Lock, CheckCircle2, AlertCircle, Delete, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';
import { User } from '../types';

export const AuthPage: React.FC = () => {
  const { allUsers, adminLoginWithPin, memberLoginWithPin } = useAuth();

  const [authMode, setAuthMode] = useState<'ADMIN' | 'MEMBER'>('ADMIN');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const adminUser = allUsers.find((u) => u.role === 'ADMIN') || allUsers[0];
  const teamMembers = allUsers.filter((u) => u.role === 'TEAM_MEMBER');

  // Set default selected member
  useEffect(() => {
    if (teamMembers.length > 0 && !selectedMemberId) {
      setSelectedMemberId(teamMembers[0].id);
    }
  }, [teamMembers, selectedMemberId]);

  // Clear pin and errors on tab change
  const switchMode = (mode: 'ADMIN' | 'MEMBER') => {
    setAuthMode(mode);
    setPin('');
    setError('');
  };

  const selectedMember = teamMembers.find((m) => m.id === selectedMemberId);

  // Handle number pad clicks
  const handleDigitClick = (digit: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
      setError('');
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  // Listen to physical keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        if (pin.length < 6) {
          setPin((prev) => prev + e.key);
          setError('');
        }
      } else if (e.key === 'Backspace') {
        setPin((prev) => prev.slice(0, -1));
      } else if (e.key === 'Enter') {
        handleFormSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, authMode, selectedMemberId]);

  const handleFormSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin) {
      setError('Please enter your access PIN.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    setTimeout(() => {
      if (authMode === 'ADMIN') {
        const res = adminLoginWithPin(pin);
        if (!res.success) {
          setError(res.error || 'Incorrect Admin PIN');
          setIsSubmitting(false);
          setPin('');
        }
      } else {
        if (!selectedMemberId) {
          setError('Please select your team member profile.');
          setIsSubmitting(false);
          return;
        }
        const res = memberLoginWithPin(selectedMemberId, pin);
        if (!res.success) {
          setError(res.error || 'Incorrect PIN. Contact Admin if forgotten.');
          setIsSubmitting(false);
          setPin('');
        }
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-10 sm:px-6 lg:px-8 text-slate-100 selection:bg-blue-600">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-extrabold text-2xl shadow-xl shadow-blue-500/20 mb-3">
          V
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white font-mono">VUEW</h2>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-mono">
          Team Accountability &amp; Execution Platform
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900/90 py-6 px-6 sm:px-8 shadow-2xl rounded-2xl border border-slate-800 space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => switchMode('ADMIN')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                authMode === 'ADMIN'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Login</span>
            </button>

            <button
              type="button"
              onClick={() => switchMode('MEMBER')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                authMode === 'MEMBER'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Team Member Login</span>
            </button>
          </div>

          {/* ADMIN LOGIN VIEW */}
          {authMode === 'ADMIN' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <Avatar name={adminUser.name} avatar={adminUser.avatar} size="md" />
                <div className="truncate flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white truncate">{adminUser.name}</span>
                    <Badge variant="role" role="ADMIN" size="sm" />
                  </div>
                  <span className="text-[11px] text-slate-400 truncate block">{adminUser.jobTitle}</span>
                </div>
              </div>

              <div className="text-center">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Enter Administrator PIN
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Default Demo PIN is <span className="font-mono text-blue-400 font-bold">1234</span>
                </p>
              </div>
            </div>
          )}

          {/* TEAM MEMBER LOGIN VIEW */}
          {authMode === 'MEMBER' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Select Your Account
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                  {teamMembers.map((member) => {
                    const isSelected = member.id === selectedMemberId;
                    return (
                      <div
                        key={member.id}
                        onClick={() => {
                          setSelectedMemberId(member.id);
                          setPin('');
                          setError('');
                        }}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-blue-600/15 border-blue-500/60 shadow-sm'
                            : 'bg-slate-950/60 border-slate-800 hover:bg-slate-950 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Avatar name={member.name} avatar={member.avatar} size="xs" />
                          <div className="truncate">
                            <span className={`text-xs font-semibold block truncate ${isSelected ? 'text-blue-300 font-bold' : 'text-slate-200'}`}>
                              {member.name}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate block">
                              {member.jobTitle}
                            </span>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 block">
                            PIN: {member.pin}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedMember && (
                <div className="text-center pt-1">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                    Enter PIN for {selectedMember.name}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Assigned by Admin: <span className="font-mono text-emerald-400 font-bold">{selectedMember.pin}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Masked PIN Display */}
          <div className="flex justify-center items-center gap-3 py-2">
            {[0, 1, 2, 3].map((index) => {
              const isFilled = pin.length > index;
              return (
                <div
                  key={index}
                  className={`w-11 h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-150 ${
                    isFilled
                      ? 'border-blue-500 bg-blue-600/20 text-white'
                      : 'border-slate-800 bg-slate-950 text-slate-600'
                  }`}
                >
                  {isFilled ? (
                    <div className="w-3.5 h-3.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                  ) : (
                    <span className="text-sm font-mono text-slate-700">-</span>
                  )}
                </div>
              );
            })}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleDigitClick(digit)}
                className="py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-base font-bold font-mono text-slate-200 border border-slate-800/80 active:scale-95 transition-all shadow-sm"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="py-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 text-xs font-semibold text-slate-400 border border-slate-800/80 active:scale-95 transition-all"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleDigitClick('0')}
              className="py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-base font-bold font-mono text-slate-200 border border-slate-800/80 active:scale-95 transition-all shadow-sm"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="py-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 text-slate-400 border border-slate-800/80 active:scale-95 transition-all flex items-center justify-center"
              title="Backspace"
            >
              <Delete className="w-4 h-4" />
            </button>
          </div>

          {/* Submit Action */}
          <button
            type="button"
            disabled={isSubmitting || pin.length === 0}
            onClick={() => handleFormSubmit()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{authMode === 'ADMIN' ? 'Unlock Admin Cockpit' : 'Sign In as Member'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Helper / Hint Footer */}
          <div className="pt-2 text-center">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3 text-slate-500" />
              <span>Admins set and manage all team member PINs in the workspace.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
