import React, { useState, useEffect } from 'react';
import {
  Settings,
  User as UserIcon,
  Bell,
  Shield,
  Sliders,
  Database,
  Check,
  RotateCcw,
  Download,
  AlertTriangle,
  KeyRound,
  Eye,
  EyeOff,
  Lock,
  Smartphone,
  CheckCircle,
  Wifi,
  Send,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from '../components/pwa/PWAInstallModal';
import { pushNotificationService } from '../services/pushNotification';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';
import { Toggle } from '../components/common/Toggle';

export const SettingsPage: React.FC = () => {
  const { currentUser, allUsers, setMemberPin, updateProfile, refreshUsers } = useAuth();
  const { tasks, projects, resetDemoData } = useData();
  const { isInstalled, isInstallable, platform, install } = usePWAInstall();
  const [installModalOpen, setInstallModalOpen] = useState(false);

  // Push notification state
  const [pushPermission, setPushPermission] = useState<NotificationPermission>(() =>
    pushNotificationService.getPermission()
  );
  const [pushStatusMessage, setPushStatusMessage] = useState<string>('');

  const [activeTab, setActiveTab] = useState<
    'PROFILE' | 'PIN_SECURITY' | 'INSTALL_APP' | 'NOTIFICATIONS' | 'ACCOUNTABILITY' | 'ROLES' | 'DATA'
  >('PROFILE');

  // Local state for profile form
  const [name, setName] = useState(currentUser.name);
  const [jobTitle, setJobTitle] = useState(currentUser.jobTitle);
  const [phone, setPhone] = useState(currentUser.phone || '+1 (555) 019-2834');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // PIN security states
  const [showOwnPin, setShowOwnPin] = useState(false);
  const [adminNewPin, setAdminNewPin] = useState('');
  const [adminPinFeedback, setAdminPinFeedback] = useState<{ success?: string; error?: string }>({});
  const [selectedMemberPinId, setSelectedMemberPinId] = useState<string>('');
  const [memberNewPinInput, setMemberNewPinInput] = useState<string>('');
  const [memberPinFeedback, setMemberPinFeedback] = useState<{ success?: string; error?: string }>({});

  // Notification toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slackAlerts, setSlackAlerts] = useState(true);
  const [dailyStandupDigest, setDailyStandupDigest] = useState(true);
  const [blockerImmediatePing, setBlockerImmediatePing] = useState(true);

  // Accountability thresholds
  const [staleThresholdDays, setStaleThresholdDays] = useState(2);
  const [atRiskBufferDays, setAtRiskBufferDays] = useState(3);
  const [requireBlockerExplanation, setRequireBlockerExplanation] = useState(true);

  useEffect(() => {
    setName(currentUser.name);
    setJobTitle(currentUser.jobTitle);
    setPhone(currentUser.phone || '+1 (555) 019-2834');
    setBio(currentUser.bio || '');
  }, [currentUser]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      jobTitle,
      phone,
      bio,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleUpdateAdminPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminNewPin || adminNewPin.length < 4) {
      setAdminPinFeedback({ error: 'PIN must be at least 4 digits.' });
      return;
    }

    const ok = setMemberPin(currentUser.id, adminNewPin);
    if (ok) {
      setAdminPinFeedback({ success: 'Admin PIN updated successfully!' });
      setAdminNewPin('');
      setTimeout(() => setAdminPinFeedback({}), 3000);
    } else {
      setAdminPinFeedback({ error: 'Failed to update PIN.' });
    }
  };

  const handleUpdateMemberPin = (memberId: string, pinValue: string) => {
    if (!pinValue || pinValue.length < 4) {
      setMemberPinFeedback({ error: 'PIN must be at least 4 digits.' });
      return;
    }

    const ok = setMemberPin(memberId, pinValue);
    if (ok) {
      setMemberPinFeedback({ success: 'Member PIN updated successfully!' });
      setSelectedMemberPinId('');
      setMemberNewPinInput('');
      setTimeout(() => setMemberPinFeedback({}), 3000);
    } else {
      setMemberPinFeedback({ error: 'Failed to update PIN.' });
    }
  };

  const handleExportData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      tasks,
      projects,
      users: allUsers,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vuew-accountability-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'PROFILE', label: 'Profile', icon: UserIcon },
    { id: 'PIN_SECURITY', label: 'Security & PIN', icon: KeyRound },
    { id: 'INSTALL_APP', label: 'Install App (PWA)', icon: Download },
    { id: 'NOTIFICATIONS', label: 'Notifications', icon: Bell },
    { id: 'ACCOUNTABILITY', label: 'Accountability Rules', icon: Sliders },
    { id: 'ROLES', label: 'Roles & RBAC', icon: Shield },
    { id: 'DATA', label: 'Data Management', icon: Database },
  ] as const;

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-black font-black text-lg shadow-[0_0_20px_rgba(249,115,22,0.35)]">
            <Settings className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">System Settings</h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Accountability rules, role permissions, notifications, and PIN security management.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-zinc-800/80 pb-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? 'bg-orange-500 text-black font-bold shadow-md shadow-orange-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
              <span>{tab.label}</span>
              {'badge' in tab && !isActive && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab: PROFILE */}
      {activeTab === 'PROFILE' && (
        <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-5">
          <div className="flex items-center gap-4 pb-5 border-b border-zinc-800">
            <Avatar name={currentUser.name} avatar={currentUser.avatar} size="xl" />
            <div>
              <h3 className="text-base font-bold text-white">{currentUser.name}</h3>
              <p className="text-xs text-zinc-400">{currentUser.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="role" role={currentUser.role} size="sm" />
                <span className="text-[11px] font-mono text-orange-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                  PIN: {showOwnPin ? currentUser.pin : '••••'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowOwnPin(!showOwnPin)}
                  className="p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  {showOwnPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Job Title &amp; Role Spec
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-xl px-3 py-2 text-xs text-zinc-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Focus &amp; Scope Summary
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Primary deliverables, cross-functional dependencies..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            {profileSaved ? (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Profile changes saved successfully
              </span>
            ) : (
              <span className="text-xs text-zinc-500">Changes reflected in active session</span>
            )}
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-black text-xs font-bold shadow-md shadow-orange-500/20 transition-all active:scale-[0.98]"
            >
              Save Profile
            </button>
          </div>
        </form>
      )}

      {/* Tab: PIN SECURITY & ACCESS */}
      {activeTab === 'PIN_SECURITY' && (
        <div className="space-y-6">
          {/* Admin PIN Settings */}
          {currentUser.role === 'ADMIN' ? (
            <>
              {/* Change Admin PIN Form */}
              <form onSubmit={handleUpdateAdminPin} className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Shield className="w-4 h-4 text-orange-400" />
                      <span>Admin Master Security PIN</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Your master administrator PIN unlocks administrative controls and system governance.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-zinc-900 rounded-xl border border-zinc-800">
                    <span className="text-xs text-zinc-400">Current:</span>
                    <span className="font-mono text-sm font-bold text-orange-400">
                      {showOwnPin ? currentUser.pin : '••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowOwnPin(!showOwnPin)}
                      className="p-1 text-zinc-400 hover:text-white"
                    >
                      {showOwnPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                      New Admin PIN
                    </label>
                    <input
                      type="text"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={adminNewPin}
                      onChange={(e) => setAdminNewPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 4 or 6-digit PIN"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={!adminNewPin}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-black text-xs font-bold transition-all"
                    >
                      Update Master PIN
                    </button>
                  </div>
                </div>

                {adminPinFeedback.success && (
                  <p className="text-xs text-emerald-400 font-semibold">{adminPinFeedback.success}</p>
                )}
                {adminPinFeedback.error && (
                  <p className="text-xs text-rose-400 font-semibold">{adminPinFeedback.error}</p>
                )}
              </form>

              {/* Manage All Team Members PINs */}
              <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-orange-400" />
                      <span>Team Member PIN Governance</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Admins set and manage member access credentials directly.
                    </p>
                  </div>
                </div>

                {memberPinFeedback.success && (
                  <p className="text-xs text-emerald-400 font-semibold p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    {memberPinFeedback.success}
                  </p>
                )}

                <div className="divide-y divide-zinc-800/80">
                  {allUsers.map((member) => {
                    const isEditing = selectedMemberPinId === member.id;
                    return (
                      <div
                        key={member.id}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar name={member.name} avatar={member.avatar} size="md" />
                          <div>
                            <span className="text-xs font-bold text-white block">{member.name}</span>
                            <span className="text-[11px] text-zinc-400 block">{member.jobTitle}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                pattern="[0-9]*"
                                maxLength={6}
                                value={memberNewPinInput}
                                onChange={(e) => setMemberNewPinInput(e.target.value.replace(/\D/g, ''))}
                                placeholder="New PIN"
                                className="w-24 bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-1 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateMemberPin(member.id, memberNewPinInput)}
                                className="px-2.5 py-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-black text-xs font-bold"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedMemberPinId('');
                                  setMemberNewPinInput('');
                                }}
                                className="px-2 py-1 rounded-xl bg-zinc-800 text-zinc-400 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-orange-400 font-bold">
                                PIN: {member.pin}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedMemberPinId(member.id);
                                  setMemberNewPinInput(member.pin);
                                }}
                                className="px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-800 transition-colors"
                              >
                                Change PIN
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Team Member View */
            <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Team Member Access PIN
                  </h3>
                  <p className="text-xs text-zinc-400">Your login credential for the VUEW platform.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-400 block mb-1">Assigned Security PIN</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold text-orange-400">
                      {showOwnPin ? currentUser.pin : '••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowOwnPin(!showOwnPin)}
                      className="p-1 text-zinc-400 hover:text-white"
                    >
                      {showOwnPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="text-right max-w-xs">
                  <span className="text-[11px] text-zinc-400 leading-relaxed block">
                    Assigned by your project administrator. Contact an Admin to update your PIN.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: INSTALL APP (PWA) */}
      {activeTab === 'INSTALL_APP' && (
        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-orange-400" />
                <span>Progressive Web App (PWA) Status</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Install VUEW as a native desktop or mobile application with offline task caching.
              </p>
            </div>

            {isInstalled ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle className="w-3.5 h-3.5" />
                Installed
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setInstallModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-black text-xs font-bold shadow-md shadow-orange-500/20 transition-all active:scale-[0.98]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Open Install Guide</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold text-xs">
                <Smartphone className="w-4 h-4 text-orange-400" />
                <span>Mobile iOS &amp; Android</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Add directly to your home screen. Operates standalone with zero browser toolbars and instantaneous launching.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold text-xs">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span>Desktop App</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Install as a desktop application via Chrome or Edge. Adds VUEW to your Windows Start Menu or macOS Applications folder.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold text-xs">
                <Wifi className="w-4 h-4 text-orange-400" />
                <span>Offline Storage</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Service Worker actively precaches assets. Offline progress updates are automatically queued and synced when reconnected.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: NOTIFICATIONS (With Tactile Toggles) */}
      {activeTab === 'NOTIFICATIONS' && (
        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
            Notification &amp; Digest Dispatch Rules
          </h3>

          <div className="space-y-4 divide-y divide-zinc-800/80">
            <div className="pt-3 first:pt-0">
              <Toggle
                checked={blockerImmediatePing}
                onChange={setBlockerImmediatePing}
                label="Instant Blocker Escalations"
                description="Immediately notify project leads when an assignee flags a blocker."
                color="orange"
              />
            </div>

            <div className="pt-3">
              <Toggle
                checked={emailAlerts}
                onChange={setEmailAlerts}
                label="Task Assignment Notifications"
                description="Notify team members automatically when a new task is assigned to them."
                color="orange"
              />
            </div>

            <div className="pt-3">
              <Toggle
                checked={dailyStandupDigest}
                onChange={setDailyStandupDigest}
                label="Daily Standup Digest"
                description="Automated morning briefing summarizing tasks due today, at-risk deadlines, and pending reviews."
                color="orange"
              />
            </div>

            <div className="pt-3">
              <Toggle
                checked={slackAlerts}
                onChange={setSlackAlerts}
                label="Admin Review Requests"
                description="Ping administrator when a task progress reaches 100% and requires official sign-off."
                color="orange"
              />
            </div>
          </div>

          {/* Web Push Notification Section for PWA */}
          <div className="mt-6 pt-5 border-t border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Web Push Device Notifications (PWA)
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      pushPermission === 'granted'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : pushPermission === 'denied'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    Permission: {pushPermission}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Deliver urgent task updates, blocker alerts, and approvals directly to your device lock screen.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={async () => {
                  const perm = await pushNotificationService.requestPermission();
                  setPushPermission(perm);
                  if (perm === 'granted') {
                    setPushStatusMessage('Device push notifications enabled!');
                    setTimeout(() => setPushStatusMessage(''), 4000);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-black text-xs font-bold shadow-md shadow-orange-500/20 transition-all"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Enable Push Notifications</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  const sent = await pushNotificationService.sendTestNotification();
                  if (sent) {
                    setPushStatusMessage('Test alert dispatched to lock screen.');
                  } else {
                    setPushStatusMessage('Notice: Enable push permissions above first.');
                  }
                  setTimeout(() => setPushStatusMessage(''), 4000);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-semibold transition-all"
              >
                <Send className="w-3.5 h-3.5 text-orange-400" />
                <span>Dispatch Test Push Alert</span>
              </button>
            </div>

            {pushStatusMessage && (
              <p className="text-xs text-orange-400 font-medium animate-in fade-in">
                {pushStatusMessage}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab: ACCOUNTABILITY RULES (With Tactile Toggles) */}
      {activeTab === 'ACCOUNTABILITY' && (
        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
            Automated Accountability Health Engine
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Stale Task Inactivity Threshold (Days)
              </label>
              <p className="text-[11px] text-zinc-400 mb-2">
                If an active task receives no progress update for this number of days, its health automatically degrades to &ldquo;Needs Attention&rdquo;.
              </p>
              <input
                type="number"
                min="1"
                max="7"
                value={staleThresholdDays}
                onChange={(e) => setStaleThresholdDays(Number(e.target.value))}
                className="w-24 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                At-Risk Proximity Buffer (Days Before Due Date)
              </label>
              <p className="text-[11px] text-zinc-400 mb-2">
                Tasks with progress under 60% with this number of days remaining automatically trigger &ldquo;At Risk&rdquo; status.
              </p>
              <input
                type="number"
                min="1"
                max="14"
                value={atRiskBufferDays}
                onChange={(e) => setAtRiskBufferDays(Number(e.target.value))}
                className="w-24 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>

            <div className="pt-3 border-t border-zinc-800">
              <Toggle
                checked={requireBlockerExplanation}
                onChange={setRequireBlockerExplanation}
                label="Require Blocker Justification"
                description="Assignees cannot flag a task as BLOCKED without providing an explicit obstacle explanation."
                color="orange"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab: ROLES & RBAC */}
      {activeTab === 'ROLES' && (
        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
            Role-Based Access Control (RBAC) Matrix
          </h3>
          <p className="text-xs text-zinc-400 mb-4">
            VUEW enforces strict governance between Administrator and Team Member roles.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Permission / Capability</th>
                  <th className="py-2.5 px-3">Admin</th>
                  <th className="py-2.5 px-3">Team Member</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                <tr>
                  <td className="py-3 px-3 font-semibold text-white">Login Authentication</td>
                  <td className="py-3 px-3 text-orange-400 font-mono font-semibold">Admin Security PIN</td>
                  <td className="py-3 px-3 text-zinc-300 font-mono font-semibold">PIN Set by Admin</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-white">Set &amp; Manage Member PINs</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">✓ (Full Control)</td>
                  <td className="py-3 px-3 text-zinc-600">—</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-white">Create &amp; Assign Tasks</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">✓</td>
                  <td className="py-3 px-3 text-zinc-600">—</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-white">Update Progress &amp; Flag Blockers</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">✓ (All Tasks)</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">✓ (Assigned Tasks)</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-white">Approve / Request Changes on Work</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">✓</td>
                  <td className="py-3 px-3 text-zinc-600">—</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-white">View Team Overview &amp; Analytics</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">✓</td>
                  <td className="py-3 px-3 text-zinc-600">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: DATA MANAGEMENT */}
      {activeTab === 'DATA' && (
        <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              Workspace Persistence &amp; Backups
            </h3>
            <p className="text-xs text-zinc-400">
              VUEW local relational storage maintains all tasks, comments, audits, and timelines securely.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white">Export Workspace Snapshot (JSON)</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Download a clean machine-readable archive of all tasks, projects, and users.
              </p>
            </div>
            <button
              onClick={handleExportData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-black text-xs font-bold shadow-md shadow-orange-500/20 transition-all active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-rose-300">Clear All Workspace Data (Fresh Start)</h4>
              <p className="text-[11px] text-rose-400/80 mt-0.5">
                Permanently clears all demo records, projects, and tasks to start with an empty, clean production workspace.
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear all data and start with an empty, clean production workspace?')) {
                  resetDemoData();
                  window.location.reload();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear All Data</span>
            </button>
          </div>
        </div>
      )}

      {/* PWA Install Modal Guide */}
      <PWAInstallModal isOpen={installModalOpen} onClose={() => setInstallModalOpen(false)} />
    </div>
  );
};
