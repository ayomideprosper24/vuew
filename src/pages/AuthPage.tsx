import React, { useState, useEffect } from 'react';
import { Shield, KeyRound, UserCheck, ArrowRight, Lock, CheckCircle2, AlertCircle, Delete, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';
import { User } from '../types';
import { pullFromSupabase } from '../services/supabaseSync';
import { getSupabaseConfig } from '../services/supabase';

export const AuthPage: React.FC = () => {
  const { allUsers, adminLoginWithPin, memberLoginWithPin, refreshUsers } = useAuth();

  const [authMode, setAuthMode] = useState<'ADMIN' | 'MEMBER'>('ADMIN');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Pull latest updates from Supabase on load
  useEffect(() => {
    if (getSupabaseConfig().isConfigured) {
      pullFromSupabase().then((res) => {
        if (res.success) {
          refreshUsers();
        }
      });
    }
  }, [refreshUsers]);

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

  const handleFormSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin) {
      setError('Please enter your access PIN.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (authMode === 'ADMIN') {
        const res = await adminLoginWithPin(pin);
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
        const res = await memberLoginWithPin(selectedMemberId, pin);
        if (!res.success) {
          setError(res.error || 'Incorrect PIN. Contact Admin if forgotten.');
          setIsSubmitting(false);
          setPin('');
        }
      }
    } catch (err: any) {
      setError('Authentication error occurred. Please retry.');
      setIsSubmitting(false);
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col justify-center py-10 sm:px-6 lg:px-8 text-zinc-100 selection:bg-orange-500 selection:text-black">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-black font-black text-2xl shadow-xl shadow-orange-500/20 mb-3">
          V
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white font-mono">VUEW</h2>
        <p className="text-xs text-zinc-400 mt-1 uppercase tracking-widest font-mono">
          Team Accountability &amp; Execution Platform
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-zinc-950/90 py-6 px-6 sm:px-8 shadow-2xl rounded-2xl border border-zinc-800 space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
            <button
              type="button"
              onClick={() => switchMode('ADMIN')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                authMode === 'ADMIN'
                  ? 'bg-orange-500 text-black font-bold shadow-md shadow-orange-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
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
                  ? 'bg-orange-500 text-black font-bold shadow-md shadow-orange-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Team Member Login</span>
            </button>
          </div>

          {/* ADMIN LOGIN VIEW */}
          {authMode === 'ADMIN' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/80">
                <Avatar name={adminUser.name} avatar={adminUser.avatar} size="md" />
                <div className="truncate flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white truncate">{adminUser.name}</span>
                    <Badge variant="role" role="ADMIN" size="sm" />
                  </div>
                  <span className="text-[11px] text-zinc-400 truncate block">{adminUser.jobTitle}</span>
                </div>
              </div>

              <div className="text-center">
                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  Enter Administrator PIN
                </span>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Enter your secure PIN to access executive management.
                </p>
              </div>
            </div>
          )}

          {/* TEAM MEMBER LOGIN VIEW */}
          {authMode === 'MEMBER' && (
            <div className="space-y-4">
              {teamMembers.length === 0 ? (
                <div className="text-center py-5 px-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                  <UserCheck className="w-8 h-8 text-zinc-500 mx-auto" />
                  <div>
                    <h4 className="text-xs font-bold text-white">No Team Members Registered Yet</h4>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                      Log in as an Administrator to invite your team members and assign their access credentials.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => switchMode('ADMIN')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 text-black text-xs font-bold hover:bg-orange-600 transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Go to Admin Login</span>
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
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
                                ? 'bg-orange-500/10 border-orange-500/60 shadow-sm'
                                : 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <Avatar name={member.name} avatar={member.avatar} size="xs" />
                              <div className="truncate">
                                <span className={`text-xs font-semibold block truncate ${isSelected ? 'text-orange-400 font-bold' : 'text-zinc-200'}`}>
                                  {member.name}
                                </span>
                                <span className="text-[10px] text-zinc-400 truncate block">
                                  {member.jobTitle}
                                </span>
                              </div>
                            </div>

                            {isSelected && (
                              <div className="text-right flex-shrink-0">
                                <span className="w-2 h-2 rounded-full bg-orange-500 block" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {selectedMember && (
                    <div className="text-center pt-1">
                      <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                        Enter PIN for {selectedMember.name}
                      </span>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Enter your confidential security PIN to sign in.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Masked PIN Display */}
          {(authMode === 'ADMIN' || teamMembers.length > 0) && (
            <>
              <div className="flex justify-center items-center gap-3 py-2">
                {[0, 1, 2, 3].map((index) => {
                  const isFilled = pin.length > index;
                  return (
                    <div
                      key={index}
                      className={`w-11 h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-150 ${
                        isFilled
                          ? 'border-orange-500 bg-orange-500/20 text-white'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-600'
                      }`}
                    >
                      {isFilled ? (
                        <div className="w-3.5 h-3.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                      ) : (
                        <span className="text-sm font-mono text-zinc-700">-</span>
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
                    className="py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-base font-bold font-mono text-zinc-200 border border-zinc-800/80 active:scale-95 transition-all shadow-sm"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClear}
                  className="py-3 rounded-xl bg-zinc-900/70 hover:bg-zinc-800 text-xs font-semibold text-zinc-400 border border-zinc-800/80 active:scale-95 transition-all"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleDigitClick('0')}
                  className="py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-base font-bold font-mono text-zinc-200 border border-zinc-800/80 active:scale-95 transition-all shadow-sm"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="py-3 rounded-xl bg-zinc-900/70 hover:bg-zinc-800 text-zinc-400 border border-zinc-800/80 active:scale-95 transition-all flex items-center justify-center"
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
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-900 disabled:text-zinc-600 disabled:cursor-not-allowed text-black text-xs font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98]"
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
            </>
          )}

          {/* Helper / Hint Footer */}
          <div className="pt-2 text-center">
            <p className="text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3 text-zinc-500" />
              <span>Confidential authentication with end-to-end security governance.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
